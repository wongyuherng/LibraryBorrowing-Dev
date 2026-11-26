const express = require('express');
const logger = require('./logger');
const { metricsMiddleware, metricsHandler } = require('./metrics');
const { MongoClient } = require('mongodb');
const redis = require('redis');
const cors = require('cors');
const { isValidCartItem, isValidUserId } = require('./validators');

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

const CART_TTL = 3600;

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'order-service',
    port: 3003
  });
});

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const mongoClient = new MongoClient(MONGO_URL);

let ordersDb;

mongoClient.connect()
  .then(() => {
    ordersDb = mongoClient.db('libraryborrowing_db');
    logger.info('[order-service] MongoDB connected');
  })
  .catch(err => {
    logger.error('[order-service] MongoDB error:', { error: err.message });
  });

// Redis connection
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

const redisClient = redis.createClient({
  url: REDIS_URL
});

redisClient.on('error', err => {
  logger.error('[order-service] Redis error:', { error: err.message });
});

redisClient.connect()
  .then(() => {
    logger.info('[order-service] Redis connected');
  })
  .catch(err => {
    logger.error('[order-service] Redis connection failed:', { error: err.message });
  });

// Redis cart key
const cartKey = userId => `borrowing:cart:user${userId}`;

// Get borrowing cart
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const raw = await redisClient.get(cartKey(req.params.userId));

    res.json(
      raw ? JSON.parse(raw) : {
        items: [],
        totalBooks: 0
      }
    );

  } catch (err) {
    logger.error('Cart read error:', { error: err.message });
    res.status(500).json({
      error: 'Could not read cart'
    });
  }
});

// Add book to borrowing cart
app.post('/api/cart/:userId/items', async (req, res) => {
  const { bookCode, title, qty } = req.body;

  if (!isValidCartItem(bookCode, title, qty)) {
    return res.status(400).json({
      error: 'bookCode, title and a positive qty are required'
    });
  }

  try {
    const key = cartKey(req.params.userId);
    const raw = await redisClient.get(key);

    const cart = raw ? JSON.parse(raw) : {
      items: [],
      totalBooks: 0
    };

    const existing = cart.items.find(
      item => item.bookCode === bookCode
    );

    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({
        bookCode,
        title,
        qty
      });
    }

    cart.totalBooks = cart.items.reduce(
      (sum, item) => sum + item.qty, 0
    );

    await redisClient.set(
      key,
      JSON.stringify(cart),
      { EX: CART_TTL }
    );

    res.status(201).json(cart);

  } catch (err) {
    logger.error('Cart write error:', { error: err.message });
    res.status(500).json({
      error: 'Could not update cart'
    });
  }
});

// Place borrowing order
app.post('/api/orders', async (req, res) => {
  const userId = Number(req.body.userId);

  if (!isValidUserId(userId)) {
    return res.status(400).json({
      error: 'Valid userId is required'
    });
  }

  if (!ordersDb) {
    return res.status(503).json({
      error: 'Order database not ready'
    });
  }

  try {
    const raw = await redisClient.get(cartKey(userId));

    const cart = raw ? JSON.parse(raw) : {
      items: [],
      totalBooks: 0
    };

    if (!cart.items.length) {
      return res.status(400).json({
        error: 'Borrowing cart is empty'
      });
    }

    const now = new Date();

    const order = {
      userId,
      items: cart.items,
      totalBooks: cart.totalBooks,
      status: 'pending',
      placedAt: now,
      statusHistory: [
        {
          status: 'pending',
          at: now
        }
      ]
    };

    const result = await ordersDb
      .collection('borrowing_orders')
      .insertOne(order);

    // Delete temporary cart after successful order creation
    await redisClient.del(cartKey(userId));

    res.status(201).json({
      message: 'Borrowing request submitted',
      orderId: result.insertedId,
      totalBooks: order.totalBooks
    });

  } catch (err) {
    logger.error('Order creation error:', { error: err.message });
    res.status(500).json({
      error: 'Could not submit borrowing request'
    });
  }
});

// Get borrowing history
app.get('/api/orders/user/:userId', async (req, res) => {
  if (!ordersDb) {
    return res.status(503).json({
      error: 'Order database not ready'
    });
  }

  try {
    const orders = await ordersDb
      .collection('borrowing_orders')
      .find({
        userId: Number(req.params.userId)
      })
      .sort({ placedAt: -1 })
      .toArray();

    res.json(orders);

  } catch (err) {
    logger.error('Borrowing history error:', { error: err.message });
    res.status(500).json({
      error: 'Could not load borrowing history'
    });
  }
});

app.get('/metrics', metricsHandler);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  logger.info(`[order-service] Running on port ${PORT}`);
});