// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import database configuration
const AppDataSource = require('../src/config/database');

// Import routes
const authRoutes = require('../src/routes/auth');
const eventRoutes = require('../src/routes/events');
const messageRoutes = require('../src/routes/messages');
const reviewRoutes = require('../src/routes/reviews');
const adminRoutes = require('../src/routes/admin');

const app = express();

// Initialize database connection (with connection pooling for serverless)
let isDbInitialized = false;

const initializeDatabase = async () => {
  if (!isDbInitialized) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      isDbInitialized = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
};

// Middleware
app.use(helmet());
app.use(compression());

// Only use morgan in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:8081'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting (more aggressive for serverless)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for serverless cold starts
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes with database initialization
app.use('/api/auth', async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
}, authRoutes);

app.use('/api/events', async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
}, eventRoutes);

app.use('/api/messages', async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
}, messageRoutes);

app.use('/api/reviews', async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
}, reviewRoutes);

app.use('/api/admin', async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
}, adminRoutes);

// Catch-all for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Local Events API - Vercel Deployment',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      events: '/api/events',
      messages: '/api/messages',
      reviews: '/api/reviews',
      admin: '/api/admin'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
  });
});

// Export for Vercel
module.exports = app;