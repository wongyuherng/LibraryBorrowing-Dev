
const express = require('express');
const cors    = require('cors');
const db      = require('./db');
const authRoutes = require('./auth');

// USER SERVICE
// Existing: register and login in auth.js
// New: GET /api/users/:id

// BOOK SERVICE
// Existing: GET /api/books
// Existing: GET /api/books/category/:category
// New: GET /api/books/:id

// BORROWING SERVICE
// New: borrowing cart and borrowing order routes
// Redis: temporary cart
// MongoDB: permanent borrowing orders

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use(express.static('public'));

// ── HEALTH CHECK ───────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'libraryborrowing-backend' });
});

// ── GET ALL BOOKS ───────────────────────────────────
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM books ORDER BY category, title'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Book fetch error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Could not load books'
    });
  }
});

// ── GET BOOKS BY CATEGORY ───────────────────────────
app.get('/api/books/category/:category', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM books WHERE category = ? ORDER BY title',
      [req.params.category]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Library Borrowing backend running on port ${PORT}`);
});
