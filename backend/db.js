
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'db',
  user:               process.env.DB_USER     || 'library_user',
  password:           process.env.DB_PASSWORD || 'library_password',
  database:           process.env.DB_NAME     || 'libraryborrowing_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
});

// Test the pool at startup
pool.getConnection()
  .then(conn => {
    console.log('MySQL connected — Library Borrowing database ready');
    conn.release();
  })
  .catch(err => console.error('MySQL connection error:', err.message));

module.exports = pool;
