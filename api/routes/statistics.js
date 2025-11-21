const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Level = require('../models/Level');
const Question = require('../models/Question');
const { authenticateToken, requireApproval } = require('../middleware/auth');

// Genel istatistikler
router.get('/general', authenticateToken, requireApproval, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalLevels = await Level.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const activeUsers = await User.countDocuments({ 
      role: 'user', 
      isApproved: true,
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Son 7 gün
    });

    // En yüksek seviye
    const topUser = await User.findOne({ role: 'user' })
      .sort({ currentLevel: -1 })
      .select('currentLevel');

    const stats = {
      totalUsers,
      totalLevels,
      totalQuestions,
      activeUsers,
      highestLevel: topUser ? topUser.currentLevel : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Liderlik tablosu
router.get('/leaderboard', authenticateToken, requireApproval, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const leaderboard = await User.find({ 
      role: 'user',
      isApproved: true 
    })
    .select('username currentLevel completedLevels totalScore createdAt')
    .sort({ 
      currentLevel: -1, 
      totalScore: -1,
      createdAt: 1 
    })
    .limit(limit);

    // Her kullanıcı için ek bilgiler hesapla
    const enrichedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      currentLevel: user.currentLevel,
      completedLevels: user.completedLevels ? user.completedLevels.length : 0,
      totalScore: user.totalScore || 0,
      joinDate: user.createdAt
    }));

    res.json(enrichedLeaderboard);
  } catch (error) {
    console.error('Liderlik tablosu hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı performans istatistikleri
router.get('/user-performance/:userId?', authenticateToken, requireApproval, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const user = await User.findById(userId)
      .select('username currentLevel completedLevels totalScore testHistory');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Test geçmişi analizi
    const testHistory = user.testHistory || [];
    const totalTests = testHistory.length;
    const passedTests = testHistory.filter(test => test.passed).length;
    const averageScore = totalTests > 0 
      ? testHistory.reduce((sum, test) => sum + test.score, 0) / totalTests 
      : 0;

    // Son 7 günlük aktivite
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTests = testHistory.filter(test => 
      new Date(test.completedAt) >= lastWeek
    );

    const performance = {
      username: user.username,
      currentLevel: user.currentLevel,
      completedLevels: user.completedLevels ? user.completedLevels.length : 0,
      totalScore: user.totalScore || 0,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0,
      averageScore: averageScore.toFixed(1),
      recentActivity: recentTests.length,
      testHistory: testHistory.slice(-10) // Son 10 test
    };

    res.json(performance);
  } catch (error) {
    console.error('Kullanıcı performans hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Seviye istatistikleri
router.get('/levels', authenticateToken, requireApproval, async (req, res) => {
  try {
    const levels = await Level.find()
      .select('name level description')
      .sort({ level: 1 });

    // Her seviye için kullanıcı sayısını hesapla
    const levelStats = await Promise.all(
      levels.map(async (level) => {
        const usersAtLevel = await User.countDocuments({
          role: 'user',
          currentLevel: level.level
        });
        
        const usersCompleted = await User.countDocuments({
          role: 'user',
          'completedLevels.level': level.level
        });

        return {
          level: level.level,
          name: level.name,
          description: level.description,
          usersAtLevel,
          usersCompleted,
          completionRate: usersAtLevel > 0 ? (usersCompleted / usersAtLevel * 100).toFixed(1) : 0
        };
      })
    );

    res.json(levelStats);
  } catch (error) {
    console.error('Seviye istatistik hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
