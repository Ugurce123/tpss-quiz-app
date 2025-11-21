const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Başarısız giriş denemelerini takip et
const failedAttempts = new Map();

// IP bazlı rate limiting
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

// Gelişmiş token doğrulama middleware'i
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

// Gelişmiş admin yetkisi kontrolü
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

// Gelişmiş onay kontrolü
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

module.exports = { 
  authenticateToken, 
  requireAdmin, 
  requireApproval,
  bruteForceProtection,
  recordFailedAttempt,
  clearFailedAttempts,
  createRateLimit
};