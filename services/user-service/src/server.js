
const express = require('express');
const logger = require('./logger');
const { metricsMiddleware, metricsHandler } = require('./metrics');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { validateRegistration, validateLogin } = require('./validators');

const app = express();

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.use((req, res, next) => {
  res.on('finish', () => {
    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode
    });
  });
  next();
});

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// MySQL connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'library_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'libraryborrowing_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access token is required'
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
}

// Role-Based Access Control Middleware
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    port: 3001
  });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name, phone } = req.body;

  const validationError = validateRegistration(email, password, full_name);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)',
      [email, password_hash, full_name, phone || null]
    );

    res.status(201).json({
      message: 'Account created successfully',
      userId: result.insertId,
      role: 'student'
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    logger.error('Registration error:', { error: err.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login and generate JWT
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const validationError = validateLogin(email, password);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      expiresIn: '1h',
      user: {
        userId: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    logger.error('Login error:', { error: err.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin-only: View all users
app.get(
  '/api/admin/users',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT id, email, full_name, role, created_at FROM users'
      );

      res.json({
        message: 'User list retrieved successfully',
        users: rows
      });

    } catch (err) {
      logger.error('Admin user lookup error:', { error: err.message });
      res.status(500).json({
        error: 'Could not load users'
      });
    }
  }
);

// Protected user lookup
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  if (String(req.user.userId) !== req.params.id) {
    return res.status(403).json({
      error: 'You can only access your own profile'
    });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, email, full_name, role, phone, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(rows[0]);

  } catch (err) {
    logger.error('User lookup error:', { error: err.message });
    res.status(500).json({
      error: 'Could not load user'
    });
  }
});

app.get('/metrics', metricsHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`[user-service] Running on port ${PORT}`);
});
