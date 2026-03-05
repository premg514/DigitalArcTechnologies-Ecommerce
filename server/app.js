const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const pincodeRoutes = require('./routes/pincodeRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');

const app = express();

// Middleware to ensure DB connection before processing requests (Critical for Vercel)
app.use(async (req, res, next) => {
  if (req.originalUrl === '/api/db-status') return next(); // Skip for status check
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed in middleware:', err);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Initialize Passport
app.use(passport.initialize());

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration — origins from env vars for secure configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'https://digital-arc-technologies-ecommerce-two.vercel.app/',
  ...(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
// NOTE: req.query is a read-only getter in Vercel/serverless environments, so we manually 
// sanitize only req.body and req.params to avoid a crash.
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth/google')) return next();
  try {
    if (req.body) req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  } catch (e) {
    // Sanitization failed silently - do not crash the request
  }
  next();
});


// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route for debugging
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-Commerce API is live',
    environment: process.env.NODE_ENV,
    health: '/health'
  });
});

// General API rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per 15 min
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pincodes', pincodeRoutes);

// Debug route to see DB error
app.get('/api/db-status', (req, res) => {
  const mongoose = require('mongoose');
  if (global.dbError) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: global.dbError.message,
      stack: process.env.NODE_ENV === 'production' ? null : global.dbError.stack
    });
  }
  res.json({
    success: true,
    message: 'Database connected successfully',
    readyState: mongoose.connection.readyState
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;