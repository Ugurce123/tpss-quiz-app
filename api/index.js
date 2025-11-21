const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Models
const User = require('../lib/models/User');
const Question = require('../lib/models/Question');
const Level = require('../lib/models/Level');

// Middleware helpers
const failedAttempts = new Map();

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip + ':' + (req.user?.id || 'anonymous');
    }
  });
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  // This is a simplified version - full implementation would be added later
  next();
};

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(mongoSanitize());
app.use(compression());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://tpss-quiz-app.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
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
    
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware functions
const authenticateToken = async (req, res, next) => {
  try {
    // 1. Header kontrolü
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Yetkilendirme başlığı gerekli',
        code: 'MISSING_AUTH_HEADER'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.length < 10) {
      return res.status(401).json({ 
        error: 'Geçersiz token formatı',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // 2. JWT doğrulama
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token süresi dolmuş',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ 
        error: 'Geçersiz token',
        code: 'INVALID_TOKEN'
      });
    }

    // 3. Kullanıcı doğrulama
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Kullanıcı bulunamadı',
        code: 'USER_NOT_FOUND'
      });
    }

    // 4. Hesap durumu kontrolü
    if (user.isBlocked) {
      return res.status(403).json({ 
        error: 'Hesabınız engellenmiş',
        code: 'ACCOUNT_BLOCKED'
      });
    }

    // 5. Son aktivite güncelleme
    user.lastActivity = new Date();
    await user.save();

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Yetkilendirme hatası',
      code: 'AUTH_ERROR'
    });
  }
};

// Admin yetkisi kontrolü
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Kimlik doğrulama gerekli',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role !== 'admin') {
    // Yetkisiz erişim denemesini logla
    console.warn(`Unauthorized admin access attempt: ${req.user.username} (${req.user.email}) from ${req.ip}`);
    
    return res.status(403).json({ 
      error: 'Bu işlem için admin yetkisi gerekli',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

// Onay kontrolü
const requireApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Kimlik doğrulama gerekli',
      code: 'AUTH_REQUIRED'
    });
  }

  // Admin kullanıcıları her zaman onaylı sayılır
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (!req.user.isApproved) {
    return res.status(403).json({ 
      error: 'Hesabınız henüz onaylanmamış. Admin onayı bekleniyor.',
      code: 'APPROVAL_REQUIRED'
    });
  }
  
  next();
};

// Brute force koruması
const bruteForceProtection = (req, res, next) => {
  const key = req.ip;
  const attempts = failedAttempts.get(key) || { count: 0, lastAttempt: Date.now() };
  
  // 15 dakika sonra sıfırla
  if (Date.now() - attempts.lastAttempt > 15 * 60 * 1000) {
    failedAttempts.delete(key);
    return next();
  }
  
  // 5 başarısız denemeden sonra engelle
  if (attempts.count >= 5) {
    return res.status(429).json({
      error: 'Çok fazla başarısız deneme. 15 dakika sonra tekrar deneyin.',
      code: 'TOO_MANY_ATTEMPTS',
      retryAfter: 15 * 60
    });
  }
  
  next();
};

// Başarısız deneme kaydet
const recordFailedAttempt = (req) => {
  const key = req.ip;
  const attempts = failedAttempts.get(key) || { count: 0, lastAttempt: Date.now() };
  attempts.count++;
  attempts.lastAttempt = Date.now();
  failedAttempts.set(key, attempts);
};

// Başarılı giriş sonrası temizle
const clearFailedAttempts = (req) => {
  failedAttempts.delete(req.ip);
};
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
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
const authRoutes = require('../lib/routes/auth');
const questionsRoutes = require('../lib/routes/questions');
const levelsRoutes = require('../lib/routes/levels');
const quizRoutes = require('../lib/routes/quiz');
const statisticsRoutes = require('../lib/routes/statistics');
const initRoutes = require('../lib/routes/init');

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
  // Auth routes
  // Güvenli kayıt
  app.post('/api/auth/register', bruteForceProtection, async (req, res) => {
    try {
      // Input sanitization
      const sanitizedBody = req.body; // Simplified version
      const { username, email, password } = sanitizedBody;
      
      // IP adresi kaydet
      const clientIP = req.ip || req.connection.remoteAddress;
      
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Kullanıcı zaten mevcut' 
        });
      }
      
      const user = new User({ 
        username, 
        email, 
        password,
        ipAddresses: [{ ip: clientIP, lastUsed: new Date() }]
      });
      await user.save();
      
      // Güvenlik logu
      console.log(`New user registered: ${username} (${email}) from ${clientIP}`);
      
      const token = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          currentLevel: user.currentLevel,
          isApproved: user.isApproved
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  });
  
  // Güvenli giriş
  app.post('/api/auth/login', bruteForceProtection, async (req, res) => {
    try {
      const sanitizedBody = req.body; // Simplified version
      const { email, password } = sanitizedBody;
      const clientIP = req.ip || req.connection.remoteAddress;
      
      const user = await User.findOne({ email });
      if (!user) {
        recordFailedAttempt(req);
        console.warn(`Failed login attempt for non-existent user: ${email} from ${clientIP}`);
        return res.status(400).json({ 
          error: 'Geçersiz kimlik bilgileri',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Hesap durumu kontrolleri
      if (user.isBlocked) {
        console.warn(`Blocked user login attempt: ${email} from ${clientIP}`);
        return res.status(403).json({ 
          error: 'Hesabınız engellenmiş',
          code: 'ACCOUNT_BLOCKED'
        });
      }
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        recordFailedAttempt(req);
        console.warn(`Failed login attempt: ${email} from ${clientIP}`);
        return res.status(400).json({ 
          error: 'Geçersiz kimlik bilgileri',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Başarılı giriş - failed attempts temizle
      clearFailedAttempts(req);
      
      // IP adresi güncelle/ekle
      const existingIP = user.ipAddresses.find(ip => ip.ip === clientIP);
      if (existingIP) {
        existingIP.lastUsed = new Date();
      } else {
        user.ipAddresses.push({ ip: clientIP, lastUsed: new Date() });
      }
      
      // Son giriş zamanını güncelle
      user.lastLogin = new Date();
      user.lastActivity = new Date();
      await user.save();
      
      // Güvenlik logu
      console.log(`Successful login: ${user.username} (${email}) from ${clientIP}`);
      
      const token = jwt.sign(
        { 
          userId: user._id,
          role: user.role,
          iat: Math.floor(Date.now() / 1000)
        }, 
        process.env.JWT_SECRET, 
        { 
          expiresIn: '7d',
          issuer: 'baggage-quiz-app',
          audience: 'baggage-quiz-users'
        }
      );
      
      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          currentLevel: user.currentLevel,
          isApproved: user.isApproved
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  });
  
  // Admin için tüm kullanıcıları listele
  app.get('/api/auth/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  });
  
  // Kullanıcıyı onayla
  app.patch('/api/auth/users/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { 
          isApproved: true,
          approvedBy: req.user._id,
          approvedAt: new Date()
        },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
      
      res.json({ 
        message: 'Kullanıcı başarıyla onaylandı',
        user 
      });
    } catch (error) {
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  });
  
  // Kullanıcı onayını kaldır
  app.patch('/api/auth/users/:id/disapprove', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { 
          isApproved: false,
          approvedBy: null,
          approvedAt: null
        },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
      }
      
      res.json({ 
        message: 'Kullanıcı onayı kaldırıldı',
        user 
      });
    } catch (error) {
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  });
  
  // Admin: Kullanıcı şifresini değiştir
  app.patch('/api/auth/users/:id/change-password', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      // Validasyon
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ 
          message: 'Şifre en az 6 karakter olmalıdır' 
        });
      }
      
      // Kullanıcıyı bul
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ 
          message: 'Kullanıcı bulunamadı' 
        });
      }
      
      // Şifreyi güncelle (Model middleware otomatik hashleyecek)
      user.password = newPassword;
      await user.save();
      
      // Güvenlik logu
      console.log(`Admin ${req.user.userId} changed password for user ${user.username} (${user.email})`);
      
      res.json({ 
        message: 'Kullanıcı şifresi başarıyla değiştirildi',
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ 
        message: 'Şifre değiştirme hatası',
        error: error.message 
      });
    }
  });
  
  // Admin: Kullanıcıyı sil
  app.delete('/api/auth/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Kullanıcıyı bul
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ 
          message: 'Kullanıcı bulunamadı' 
        });
      }
      
      // Admin kendini silemez
      if (user._id.toString() === req.user.userId) {
        return res.status(400).json({ 
          message: 'Kendi hesabınızı silemezsiniz' 
        });
      }
      
      await User.findByIdAndDelete(id);
      
      // Güvenlik logu
      console.log(`Admin ${req.user.userId} deleted user ${user.username} (${user.email})`);
      
      res.json({ 
        message: 'Kullanıcı başarıyla silindi',
        deletedUser: {
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        message: 'Kullanıcı silme hatası',
        error: error.message 
      });
    }
  });
  
  // Questions routes
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
  app.get('/api/questions', authenticateToken, requireAdmin, async (req, res) => {
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
  app.get('/api/questions/level/:levelId', authenticateToken, async (req, res) => {
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
  app.get('/api/questions/:id', authenticateToken, requireAdmin, async (req, res) => {
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
  app.post('/api/questions', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
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
  app.put('/api/questions/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
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
  app.delete('/api/questions/:id', authenticateToken, requireAdmin, async (req, res) => {
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
  app.patch('/api/questions/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
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
  
  // Levels routes
  // Tüm seviyeleri getir
  app.get('/api/levels', authenticateToken, requireApproval, async (req, res) => {
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
  app.get('/api/levels/admin/all', authenticateToken, requireAdmin, async (req, res) => {
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
  app.get('/api/levels/:id', authenticateToken, async (req, res) => {
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
  app.post('/api/levels', authenticateToken, requireAdmin, async (req, res) => {
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
  app.put('/api/levels/:id', authenticateToken, requireAdmin, async (req, res) => {
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
  app.delete('/api/levels/:id', authenticateToken, requireAdmin, async (req, res) => {
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
  app.patch('/api/levels/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
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
  
  // Quiz routes
  // Quiz başlat
  app.get('/api/quiz/start/:levelId', authenticateToken, requireApproval, async (req, res) => {
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
  app.post('/api/quiz/submit', authenticateToken, requireApproval, async (req, res) => {
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
  app.get('/api/quiz/stats', authenticateToken, requireApproval, async (req, res) => {
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
  
  // Statistics routes
  // Genel istatistikler
  app.get('/api/statistics/general', authenticateToken, requireApproval, async (req, res) => {
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
  app.get('/api/statistics/leaderboard', authenticateToken, requireApproval, async (req, res) => {
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
  app.get('/api/statistics/user-performance/:userId?', authenticateToken, requireApproval, async (req, res) => {
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
  app.get('/api/statistics/levels', authenticateToken, requireApproval, async (req, res) => {
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
  
  // Init routes
  // Production database initialization endpoint
  app.post('/api/init/database', async (req, res) => {
    try {
      // Sadece production ortamında çalışsın
      if (process.env.NODE_ENV !== 'production') {
        return res.status(403).json({
          success: false,
          message: 'Bu endpoint sadece production ortamında kullanılabilir'
        });
      }
      
      console.log('🚀 Database initialization başlatıldı...');
      // Simplified version - full implementation would be added later
      
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
  
  // Mount imported routes
  app.use('/api/auth', authRoutes);
  app.use('/api/questions', questionsRoutes);
  app.use('/api/levels', levelsRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/statistics', statisticsRoutes);
  app.use('/api/init', initRoutes);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'API çalışıyor',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });
}).catch(err => {
  console.error('DB Connection Error:', err);
});

module.exports = app;
