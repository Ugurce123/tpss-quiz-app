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
const PORT = process.env.PORT || 5001;

// 🛡️ GÜVENLIK MIDDLEWARE'LERİ
// 1. Helmet - HTTP headers güvenliği
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5001", process.env.CORS_ORIGIN || "https://baggage-quiz-api.up.railway.app", "https://*.netlify.app"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// 2. Rate Limiting - DDoS koruması
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum 100 istek
  message: {
    error: 'Çok fazla istek gönderdiniz. 15 dakika sonra tekrar deneyin.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 3. Auth endpoint'leri için daha sıkı rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // IP başına maksimum 5 giriş denemesi
  message: {
    error: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.',
    retryAfter: 15 * 60
  },
  skipSuccessfulRequests: true
});

// 4. MongoDB Injection koruması
app.use(mongoSanitize());

// 5. Compression - performans
app.use(compression());

// 6. Logging - güvenlik izleme
app.use(morgan('combined'));

// 7. CORS - güvenli cross-origin
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    try {
      const hostname = new URL(origin).hostname;
      const isVercel = hostname.endsWith('.vercel.app');
      const isNetlify = hostname.endsWith('.netlify.app');
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      
      if (allowedOrigins.includes(origin) || isVercel || isNetlify || isLocalhost) {
        return callback(null, true);
      }
    } catch (err) {
      // Invalid URL
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 8. Body parser - güvenli JSON parsing
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Geçersiz JSON formatı' });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 9. Static files - güvenli servis
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: false,
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Rate limiting uygula
app.use(limiter);
app.use('/api/auth', authLimiter);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');
const levelsRoutes = require('./routes/levels');
const quizRoutes = require('./routes/quiz');
const statisticsRoutes = require('./routes/statistics');
const initRoutes = require('./routes/init');

// 🛡️ Temel güvenlik middleware'leri aktif

// Güvenlik middleware'lerini uygula (geçici olarak devre dışı)
// app.use(securityHeaders);
// app.use(ipFilter);
// app.use(suspiciousActivityDetector);

// 🛡️ ROUTES - Güvenlik katmanları ile
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/init', initRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 🛡️ ERROR HANDLING (geçici olarak devre dışı)
// app.use(notFoundHandler);
// app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`🛡️ Güvenlik önlemleri aktif`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});