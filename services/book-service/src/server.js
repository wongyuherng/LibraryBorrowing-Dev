const express = require('express');
const logger = require('./logger');
const { metricsMiddleware, metricsHandler } = require('./metrics');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { isValidBookId } = require('./validators');

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
    service: 'book-service',
    port: 3002
  });
});

// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM books ORDER BY category, title'
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    logger.error('Book fetch error:', { error: err.message });
    res.status(500).json({
      success: false,
      error: 'Could not load books'
    });
  }
});

// Get books by category
app.get('/api/books/category/:category', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM books WHERE category = ? ORDER BY title',
      [req.params.category]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    logger.error('Category error:', { error: err.message });
    res.status(500).json({
      success: false,
      error: 'Could not load category'
    });
  }
});

// Get one book by ID
app.get('/api/books/:id', async (req, res) => {
  if (!isValidBookId(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid book ID'
    });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM books WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (err) {
    logger.error('Book lookup error:', { error: err.message });
    res.status(500).json({
      success: false,
      error: 'Could not load book'
    });
  }
});

app.get('/metrics', metricsHandler);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`[book-service] Running on port ${PORT}`);
});