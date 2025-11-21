const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { 
  authenticateToken, 
  requireAdmin, 
  bruteForceProtection,
  recordFailedAttempt,
  clearFailedAttempts
} = require('./middleware/auth');
const { 
  validateRegister, 
  validateLogin,
  sanitizeObject 
} = require('./middleware/validation');
const router = express.Router();

// Güvenli kayıt
router.post('/register', bruteForceProtection, validateRegister, async (req, res) => {
  try {
    // Input sanitization
    const sanitizedBody = sanitizeObject(req.body);
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
router.post('/login', bruteForceProtection, validateLogin, async (req, res) => {
  try {
    const sanitizedBody = sanitizeObject(req.body);
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
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
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
router.patch('/users/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
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
router.patch('/users/:id/disapprove', authenticateToken, requireAdmin, async (req, res) => {
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
router.patch('/users/:id/change-password', authenticateToken, requireAdmin, async (req, res) => {
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
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
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

module.exports = router;
