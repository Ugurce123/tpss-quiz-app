const express = require('express');
const router = express.Router();
const { initProductionDatabase } = require('../init-production-db');

// Production database initialization endpoint
router.post('/database', async (req, res) => {
  try {
    // Sadece production ortamında çalışsın
    if (process.env.NODE_ENV !== 'production') {
      return res.status(403).json({
        success: false,
        message: 'Bu endpoint sadece production ortamında kullanılabilir'
      });
    }

    console.log('🚀 Database initialization başlatıldı...');
    await initProductionDatabase();
    
    res.json({
      success: true,
      message: 'Production database başarıyla hazırlandı!',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database initialization hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Database initialization hatası',
      error: error.message
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API çalışıyor',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
