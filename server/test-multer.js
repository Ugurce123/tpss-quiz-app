const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();

// Multer konfigürasyonu
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('📎 Dosya filtresi:', file);
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

// Test endpoint
app.post('/test-upload', upload.single('image'), (req, res) => {
  try {
    console.log('🧪 Test upload endpoint çağrıldı');
    console.log('📦 Body:', req.body);
    console.log('📎 File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya bulunamadı' });
    }
    
    // Dosyayı kaydet
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const ext = path.extname(req.file.originalname);
    const uniqueName = crypto.randomBytes(16).toString('hex') + ext;
    const filePath = path.join(uploadsDir, uniqueName);
    
    fs.writeFileSync(filePath, req.file.buffer);
    
    const publicUrl = `/uploads/${uniqueName}`;
    
    res.json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      filename: uniqueName,
      url: publicUrl,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
  } catch (error) {
    console.error('❌ Test upload hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🧪 Test server ${PORT} portunda çalışıyor`);
  console.log(`Test URL: http://localhost:${PORT}/test-upload`);
});