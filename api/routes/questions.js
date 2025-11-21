const express = require('express');
const multer = require('multer');
const path = require('path');
const Question = require('./models/Question');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

const router = express.Router();

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Tüm soruları getir (Admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Seviyeye göre soruları getir
router.get('/level/:levelId', authenticateToken, async (req, res) => {
  try {
    const questions = await Question.find({ 
      level: req.params.levelId,
      isActive: true 
    }).select('-createdBy');
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tek soru getir (Admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'username email');
    
    if (!question) {
      return res.status(404).json({ message: 'Soru bulunamadı' });
    }
    
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni soru ekle (Admin)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { text, correctAnswer, level, points, explanation, difficulty, category, dirtyReason, dirtyOptions } = req.body;
    
    console.log('Yeni soru oluşturma isteği:', req.body);
    
    // Validation
    if (!text || !correctAnswer || !level) {
      return res.status(400).json({ 
        message: 'Soru metni, doğru cevap ve seviye gerekli' 
      });
    }

    // Kirli bagaj için ek validasyon
    if (correctAnswer === 'dirty') {
      if (!dirtyReason) {
        return res.status(400).json({ 
          message: 'Kirli bagaj için sebep gerekli' 
        });
      }
      
      const parsedDirtyOptions = typeof dirtyOptions === 'string' ? JSON.parse(dirtyOptions) : dirtyOptions;
      if (!parsedDirtyOptions || parsedDirtyOptions.length === 0) {
        return res.status(400).json({ 
          message: 'Kirli bagaj için en az bir seçenek gerekli' 
        });
      }
    }

    const questionData = {
      text,
      correctAnswer,
      level: parseInt(level),
      points: points ? parseInt(points) : 10,
      explanation: explanation || '',
      difficulty: difficulty || 'medium',
      category: category || 'general',
      image: req.file ? req.file.filename : null,
      createdBy: req.user._id
    };

    // Kirli bagaj için ek alanlar
    if (correctAnswer === 'dirty') {
      questionData.dirtyReason = dirtyReason;
      questionData.dirtyOptions = typeof dirtyOptions === 'string' ? JSON.parse(dirtyOptions) : dirtyOptions;
    }

    const question = new Question(questionData);
    await question.save();
    await question.populate('createdBy', 'username email');
    
    console.log('Soru başarıyla oluşturuldu:', question._id);
    res.status(201).json(question);
  } catch (error) {
    console.error('Soru oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Soru güncelle (Admin)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { text, correctAnswer, level, points, explanation, difficulty, category, isActive, dirtyReason, dirtyOptions } = req.body;
    
    const updateData = {};
    
    if (text) updateData.text = text;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (level) updateData.level = parseInt(level);
    if (points) updateData.points = parseInt(points);
    if (explanation !== undefined) updateData.explanation = explanation;
    if (difficulty) updateData.difficulty = difficulty;
    if (category) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (req.file) updateData.image = req.file.filename;

    // Kirli bagaj için ek alanlar
    if (correctAnswer === 'dirty') {
      if (dirtyReason) updateData.dirtyReason = dirtyReason;
      if (dirtyOptions) {
        updateData.dirtyOptions = typeof dirtyOptions === 'string' ? JSON.parse(dirtyOptions) : dirtyOptions;
      }
    } else if (correctAnswer === 'clean') {
      // Temiz bagaj ise kirli alanları temizle
      updateData.dirtyReason = undefined;
      updateData.dirtyOptions = undefined;
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'username email');

    if (!question) {
      return res.status(404).json({ message: 'Soru bulunamadı' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Soru sil (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Soru bulunamadı' });
    }

    res.json({ message: 'Soru başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Soru durumunu değiştir (Admin)
router.patch('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Soru bulunamadı' });
    }

    question.isActive = !question.isActive;
    await question.save();

    res.json({ 
      message: `Soru ${question.isActive ? 'aktif' : 'pasif'} hale getirildi`,
      isActive: question.isActive 
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
