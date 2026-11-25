
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const PORT = process.env.PORT || 8000;

const SERVICES = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  book: process.env.BOOK_SERVICE_URL || 'http://book-service:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://order-service:3003'
};

// Enable CORS at the API Gateway
app.use(cors());

// Proxy function
function proxy(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl,
    on: {
      error: (err, req, res) => {
        if (!res.headersSent) {
          res.status(503).json({
            error: 'Upstream service unavailable',
            target,
            detail: err.message
          });
        }
      }
    }
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'libraryborrowing-api-gateway',
    port: PORT,
    routes: {
      auth: 'user-service:3001',
      users: 'user-service:3001',
      books: 'book-service:3002',
      cart: 'order-service:3003',
      orders: 'order-service:3003'
    }
  });
});

// Route requests to the correct services
app.use('/api/auth', proxy(SERVICES.user));
app.use('/api/users', proxy(SERVICES.user));
app.use('/api/books', proxy(SERVICES.book));
app.use('/api/cart', proxy(SERVICES.order));
app.use('/api/orders', proxy(SERVICES.order));

// Unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LibraryBorrowing API Gateway running on port ${PORT}`);
});
