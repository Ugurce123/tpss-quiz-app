const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(mongoSanitize());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip // Fix for forwarded header warning
});
app.use(limiter);

// MongoDB connection
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not defined');
  }
  
  const db = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  cachedDb = db;
  return db;
}

// Import routes
const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');
const levelsRoutes = require('./routes/levels');
const quizRoutes = require('./routes/quiz');
const statisticsRoutes = require('./routes/statistics');
const initRoutes = require('./routes/init');

// Health check (before DB connection)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: cachedDb ? 'connected' : 'not connected'
  });
});

// Setup routes after DB connection
connectToDatabase().then(() => {
  app.use('/api/auth', authRoutes);
  app.use('/api/questions', questionsRoutes);
  app.use('/api/levels', levelsRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/statistics', statisticsRoutes);
  app.use('/api/init', initRoutes);
}).catch(err => {
  console.error('DB Connection Error:', err);
});

module.exports = app;
