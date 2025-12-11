const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS basit konfigürasyon
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB bağlantısı
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz')
    .catch(err => console.error('MongoDB bağlantı hatası:', err));
}

// Routes
try {
  const authRoutes = require('../server/routes/auth');
  const questionsRoutes = require('../server/routes/questions');
  const levelsRoutes = require('../server/routes/levels');
  const quizRoutes = require('../server/routes/quiz');
  const statisticsRoutes = require('../server/routes/statistics');
  const initRoutes = require('../server/routes/init');

  app.use('/api/auth', authRoutes);
  app.use('/api/questions', questionsRoutes);
  app.use('/api/levels', levelsRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/statistics', statisticsRoutes);
  app.use('/api/init', initRoutes);
} catch (error) {
  console.error('Routes yükleme hatası:', error);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'API OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path
  });
});

module.exports = app;