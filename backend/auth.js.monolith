
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const router = express.Router();

const SALT_ROUNDS = 10;

// ── REGISTER ───────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password and full name are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await db.query(
      'INSERT INTO users (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)',
      [email, passwordHash, full_name, phone || null]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful'
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    console.error('Registration error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// ── LOGIN ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      userId: user.id,
      fullName: user.full_name,
      email: user.email
    });

  } catch (err) {
    console.error('Login error:', err.message);

    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

module.exports = router;
