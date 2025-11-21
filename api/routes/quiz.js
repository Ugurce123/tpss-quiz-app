const express = require('express');
const Question = require('../api/models/Question');
const User = require('../api/models/User');
const Level = require('../api/models/Level');
const { authenticateToken, requireApproval } = require('../api/middleware/auth');

const router = express.Router();

// Quiz başlat
router.get('/start/:levelId', authenticateToken, requireApproval, async (req, res) => {
  try {
    const level = await Level.findById(req.params.levelId);
    if (!level) {
      return res.status(404).json({ 
        message: 'Seviye bulunamadı' 
      });
    }

    const questions = await Question.find({ 
      level: level.level 
    }).select('-correctAnswer -dirtyReason');

    res.json({
      level,
      questions,
      totalQuestions: questions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Quiz sonucu gönder
router.post('/submit', authenticateToken, requireApproval, async (req, res) => {
  try {
    const { levelId, answers } = req.body;
    
    console.log(`Quiz submit - Kullanıcı: ${req.user.username}, Level ID: ${levelId}`);
    
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({ message: 'Seviye bulunamadı' });
    }
    
    console.log(`Seviye bulundu: ${level.name} (Level ${level.level}), Geçme puanı: %${level.passingScore}`);
    
    const questions = await Question.find({ level: level.level });
    
    let correctAnswers = 0;
    const results = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = answers[i];
      
      let isCorrect = false;
      
      if (userAnswer.answer === 'clean' && question.correctAnswer === 'clean') {
        isCorrect = true;
      } else if (
        userAnswer.answer === 'dirty' && 
        question.correctAnswer === 'dirty' &&
        userAnswer.dirtyReason === question.dirtyReason
      ) {
        isCorrect = true;
      }

      if (isCorrect) correctAnswers++;

      results.push({
        questionId: question._id,
        userAnswer: userAnswer,
        correctAnswer: {
          answer: question.correctAnswer,
          dirtyReason: question.dirtyReason
        },
        isCorrect
      });
    }

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= level.passingScore;
    
    console.log(`Quiz sonucu - Doğru: ${correctAnswers}/${questions.length}, Puan: %${score}, Geçti: ${passed}`);

    // Kullanıcı seviyesini güncelle
    const user = await User.findById(req.user._id);
    
    // Test geçmişine ekle
    const testRecord = {
      level: level.level,
      score,
      passed,
      completedAt: new Date(),
      timeSpent: req.body.timeSpent || 0 // Frontend'den gönderilecek
    };

    if (!user.testHistory) {
      user.testHistory = [];
    }
    user.testHistory.push(testRecord);

    // Toplam puanı güncelle
    if (!user.totalScore) {
      user.totalScore = 0;
    }
    user.totalScore += score;

    // Son giriş zamanını güncelle
    user.lastLogin = new Date();
    
    // Tamamlanan seviyeyi kaydet
    const completedLevel = {
      level: level.level,
      score,
      completedAt: new Date()
    };

    // Aynı seviyeyi daha önce tamamlamış mı kontrol et
    const existingCompletedIndex = user.completedLevels.findIndex(cl => cl.level === level.level);
    
    if (existingCompletedIndex >= 0) {
      // Daha önce tamamlanmışsa, daha yüksek puan ise güncelle
      if (score > user.completedLevels[existingCompletedIndex].score) {
        user.completedLevels[existingCompletedIndex] = completedLevel;
      }
    } else {
      // İlk kez tamamlanıyorsa ekle
      user.completedLevels.push(completedLevel);
    }

    // Eğer geçtiyse ve mevcut seviye bu seviye ise bir sonraki seviyeyi aç
    if (passed && user.currentLevel === level.level) {
      user.currentLevel = level.level + 1;
      console.log(`Kullanıcı ${user.username} seviye ${level.level}'i geçti. Yeni seviye: ${user.currentLevel}`);
    }

    await user.save();
    
    console.log(`Kullanıcı kaydedildi - Yeni seviye: ${user.currentLevel}, Tamamlanan seviyeler: ${user.completedLevels.length}`);

    res.json({
      score,
      correctAnswers,
      totalQuestions: questions.length,
      passed,
      passingScore: level.passingScore,
      results,
      nextLevelUnlocked: passed && user.currentLevel > level.level
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı istatistikleri
router.get('/stats', authenticateToken, requireApproval, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const totalLevels = await Level.countDocuments({ isActive: true });
    
    console.log(`Stats isteği - Kullanıcı: ${user.username}, Mevcut seviye: ${user.currentLevel}, Tamamlanan: ${user.completedLevels.length}`);
    
    // Test geçmişi istatistikleri
    const testHistory = user.testHistory || [];
    const totalTests = testHistory.length;
    const passedTests = testHistory.filter(test => test.passed).length;
    
    res.json({
      currentLevel: user.currentLevel,
      completedLevels: user.completedLevels,
      totalLevels,
      progress: Math.round((user.completedLevels.length / totalLevels) * 100),
      totalScore: user.totalScore || 0,
      totalTests,
      passedTests,
      successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    });
  } catch (error) {
    console.error('Stats hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
