// Vercel Serverless Function
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const corsOriginEnv = process.env.CORS_ORIGIN;

// 🛡️ GÜVENLIK MIDDLEWARE'LERİ
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"].concat(
        isProd
          ? (corsOriginEnv ? [corsOriginEnv] : ["https://*.vercel.app"]) 
          : ["http://localhost:3000", "http://localhost:5001"]
      ).concat(["https://*.supabase.co"])
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate Limiting - Vercel uyumlu
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Çok fazla istek gönderdiniz. 15 dakika sonra tekrar deneyin.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  },
  skip: (req, res) => {
    return process.env.NODE_ENV !== 'production';
  }
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    error: 'Çok fazla giriş denemesi. 5 dakika sonra tekrar deneyin.',
    retryAfter: 5 * 60
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req, res) => {
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  },
  skip: (req, res) => {
    return process.env.NODE_ENV !== 'production';
  }
});

// MongoDB Injection koruması
app.use(mongoSanitize());

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// CORS - Vercel uyumlu
const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const prodOrigins = [];
if (corsOriginEnv) prodOrigins.push(corsOriginEnv);
prodOrigins.push('https://*.vercel.app');
const allowedOrigins = isProd ? prodOrigins : devOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(o => {
      if (o.includes('*')) {
        const pattern = new RegExp('^' + o.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return pattern.test(origin);
      }
      return origin === o;
    });
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// OPTIONS preflight
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../server/uploads'), {
  maxAge: '1d',
  etag: false,
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// API sadece backend serve eder

// Rate limiting
app.use(limiter);
app.use('/api/auth', authLimiter);

// MongoDB bağlantısı
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).catch(err => console.error('MongoDB bağlantı hatası:', err));
}

// Routes
const authRoutes = require('../server/routes/auth');
const questionsRoutes = require('../server/routes/questions');
const levelsRoutes = require('../server/routes/levels');
const quizRoutes = require('../server/routes/quiz');
const statisticsRoutes = require('../server/routes/statistics');
const initRoutes = require('../server/routes/init');

// Routes bağla
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/init', initRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 404 handler
app.get('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint bulunamadı' });
});

// Export for Vercel
module.exports = app;