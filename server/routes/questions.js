const express = require('express');
const multer = require('multer');
const path = require('path');
const Question = require('../models/Question');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer konfigürasyonu
const storage = multer.memoryStorage();

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

// Yeni soru ekle (Admin) - Base64, Dosya veya URL ile görsel
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { text, correctAnswer, level, points, explanation, difficulty, category, dirtyReason, dirtyOptions, imageUrl, imageBase64, fileName } = req.body;
    
    console.log('🆕 Yeni soru oluşturma isteği:', req.body);
    console.log('📎 Dosya bilgisi:', req.file ? { 
      filename: req.file.originalname, 
      size: req.file.size, 
      mimetype: req.file.mimetype 
    } : 'Dosya yok');
    
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
      image: null,
      createdBy: req.user._id
    };

    // Base64 görsel varsa
    if (imageBase64) {
      try {
        console.log('📁 Base64 görsel işleniyor...');
        const publicUrl = await saveBase64Image(imageBase64, fileName || 'image.jpg');
        questionData.image = publicUrl;
        console.log('✅ Base64 görsel kaydedildi:', publicUrl);
      } catch (e) {
        console.error('❌ Base64 görsel hatası:', e);
        return res.status(500).json({ message: 'Base64 görsel yüklenemedi', error: e.message });
      }
    }
    // Dosya yükleme varsa
    else if (req.file) {
      try {
        const publicUrl = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
        questionData.image = publicUrl;
      } catch (e) {
        return res.status(500).json({ message: 'Görsel yüklenemedi', error: e.message });
      }
    } 
    // URL varsa
    else if (imageUrl) {
      questionData.image = imageUrl;
    }

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

// Soru güncelle (Admin) - Base64, Dosya veya URL ile görsel
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { text, correctAnswer, level, points, explanation, difficulty, category, isActive, dirtyReason, dirtyOptions, imageUrl, imageBase64, fileName } = req.body;
    
    const updateData = {};
    
    if (text) updateData.text = text;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (level) updateData.level = parseInt(level);
    if (points) updateData.points = parseInt(points);
    if (explanation !== undefined) updateData.explanation = explanation;
    if (difficulty) updateData.difficulty = difficulty;
    if (category) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    
    // Base64 görsel varsa
    if (imageBase64) {
      try {
        const publicUrl = await saveBase64Image(imageBase64, fileName || 'image.jpg');
        updateData.image = publicUrl;
      } catch (e) {
        return res.status(500).json({ message: 'Base64 görsel yüklenemedi', error: e.message });
      }
    }
    // Dosya yükleme varsa
    else if (req.file) {
      try {
        const publicUrl = await uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
        updateData.image = publicUrl;
      } catch (e) {
        return res.status(500).json({ message: 'Görsel yüklenemedi', error: e.message });
      }
    } 
    // URL varsa (ve boş değilse)
    else if (imageUrl && imageUrl.trim() !== '') {
      updateData.image = imageUrl;
    }
    // Eğer keepExistingImage flag'i varsa, mevcut görseli koru (hiçbir şey yapma)

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

// Local file upload function
const fs = require('fs');
const crypto = require('crypto');

// Base64 görsel kaydetme fonksiyonu
const saveBase64Image = async (base64Data, fileName) => {
  try {
    console.log('💾 Base64 görsel kaydediliyor:', fileName);
    
    // Base64 data'yı parse et
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Geçersiz Base64 formatı');
    }
    
    const mimeType = matches[1];
    const base64Content = matches[2];
    const buffer = Buffer.from(base64Content, 'base64');
    
    console.log('📊 Base64 bilgileri:', {
      mimeType,
      bufferSize: buffer.length,
      fileName
    });
    
    // uploads klasörünü oluştur
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Unique filename oluştur
    const ext = path.extname(fileName) || '.jpg';
    const uniqueName = crypto.randomBytes(16).toString('hex') + ext;
    const filePath = path.join(uploadsDir, uniqueName);
    
    // Dosyayı kaydet
    fs.writeFileSync(filePath, buffer);
    console.log('✅ Base64 görsel kaydedildi:', filePath);
    
    return `/uploads/${uniqueName}`;
  } catch (error) {
    console.error('❌ Base64 kaydetme hatası:', error);
    throw new Error(`Base64 save failed: ${error.message}`);
  }
};

const uploadImage = async (buffer, filename, contentType) => {
  try {
    console.log('📁 Upload başlatılıyor:', { filename, contentType, bufferSize: buffer.length });
    
    // uploads klasörünü oluştur
    const uploadsDir = path.join(__dirname, '../uploads');
    console.log('📂 Upload klasörü:', uploadsDir);
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Klasör oluşturuluyor...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Unique filename oluştur
    const ext = path.extname(filename);
    const uniqueName = crypto.randomBytes(16).toString('hex') + ext;
    console.log('🏷️ Unique filename:', uniqueName);
    const filePath = path.join(uploadsDir, uniqueName);
    console.log('💾 Dosya yolu:', filePath);
    
    // Dosyayı kaydet
    fs.writeFileSync(filePath, buffer);
    console.log('✅ Dosya kaydedildi!');
    
    // Public URL döndür
    const publicUrl = `/uploads/${uniqueName}`;
    console.log('🔗 Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Upload hatası:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

module.exports = router;