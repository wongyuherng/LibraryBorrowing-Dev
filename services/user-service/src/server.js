const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { validateRegistration, validateLogin } = require('./validators');

const app = express();

app.use(cors());
app.use(express.json());

const SALT_ROUNDS = 10;

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
      userId: result.insertId
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const validationError = validateLogin(email, password);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = ?',
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

    res.json({
      message: 'Login successful',
      userId: user.id,
      fullName: user.full_name,
      email: user.email
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User lookup
app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, full_name, phone, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('User lookup error:', err.message);
    res.status(500).json({
      error: 'Could not load user'
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[user-service] Running on port ${PORT}`);
});