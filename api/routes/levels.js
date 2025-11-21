const express = require('express');
const Level = require('./models/Level');
const Question = require('./models/Question');
const { authenticateToken, requireAdmin, requireApproval } = require('./middleware/auth');

const router = express.Router();

// Tüm seviyeleri getir
router.get('/', authenticateToken, requireApproval, async (req, res) => {
  try {
    console.log('Levels API: Kullanıcı:', req.user.username, 'Onaylı:', req.user.isApproved);
    
    const levels = await Level.find({ isActive: true })
      .sort({ level: 1 });
    
    console.log('Levels API: Bulunan seviyeler:', levels.length);
    
    // Her seviye için soru sayısını hesapla
    const levelsWithQuestionCount = await Promise.all(
      levels.map(async (level) => {
        const questionCount = await Question.countDocuments({ 
          level: level.level, 
          isActive: true 
        });
        return {
          ...level.toObject(),
          actualQuestionCount: questionCount
        };
      })
    );
    
    console.log('Levels API: Soru sayıları ile birlikte:', levelsWithQuestionCount.length);
    res.json(levelsWithQuestionCount);
  } catch (error) {
    console.error('Levels API hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Admin için tüm seviyeleri getir (pasif olanlar dahil)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const levels = await Level.find()
      .sort({ level: 1 });
    
    // Her seviye için soru sayısını hesapla
    const levelsWithQuestionCount = await Promise.all(
      levels.map(async (level) => {
        const questionCount = await Question.countDocuments({ 
          level: level.level 
        });
        const activeQuestionCount = await Question.countDocuments({ 
          level: level.level, 
          isActive: true 
        });
        return {
          ...level.toObject(),
          totalQuestionCount: questionCount,
          activeQuestionCount: activeQuestionCount
        };
      })
    );
    
    res.json(levelsWithQuestionCount);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Seviye detayı getir
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) {
      return res.status(404).json({ 
        message: 'Seviye bulunamadı' 
      });
    }
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni seviye ekle (Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Yeni seviye oluşturma isteği:', req.body);
    console.log('Kullanıcı:', req.user.username, req.user._id);
    
    const { name, level, description, passingScore, timeLimit, questionCount } = req.body;
    
    if (!name || !level) {
      console.log('Eksik alanlar - name:', name, 'level:', level);
      return res.status(400).json({ 
        message: 'Seviye adı ve numarası gerekli' 
      });
    }

    const existingLevel = await Level.findOne({ level: parseInt(level) });
    if (existingLevel) {
      return res.status(400).json({ 
        message: 'Bu seviye numarası zaten mevcut' 
      });
    }

    const newLevel = new Level({
      name,
      level: parseInt(level),
      description: description || '',
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 30,
      questionCount: questionCount || 10,
      createdBy: req.user._id
    });

    await newLevel.save();
    res.status(201).json(newLevel);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Seviye güncelle (Admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, passingScore, isActive, timeLimit, questionCount } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (passingScore !== undefined) updateData.passingScore = parseInt(passingScore);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (timeLimit !== undefined) updateData.timeLimit = parseInt(timeLimit);
    if (questionCount !== undefined) updateData.questionCount = parseInt(questionCount);

    const level = await Level.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!level) {
      return res.status(404).json({ 
        message: 'Seviye bulunamadı' 
      });
    }

    res.json(level);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Seviye sil (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    
    if (!level) {
      return res.status(404).json({ 
        message: 'Seviye bulunamadı' 
      });
    }

    // Bu seviyeye ait soruları kontrol et
    const questionCount = await Question.countDocuments({ level: level.level });
    
    if (questionCount > 0) {
      return res.status(400).json({ 
        message: `Bu seviyeye ait ${questionCount} soru var. Önce soruları silin veya başka seviyeye taşıyın.` 
      });
    }

    await Level.findByIdAndDelete(req.params.id);
    res.json({ message: 'Seviye başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Seviye durumunu değiştir (Admin)
router.patch('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    
    if (!level) {
      return res.status(404).json({ message: 'Seviye bulunamadı' });
    }

    level.isActive = !level.isActive;
    await level.save();

    res.json({ 
      message: `Seviye ${level.isActive ? 'aktif' : 'pasif'} hale getirildi`,
      isActive: level.isActive 
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
