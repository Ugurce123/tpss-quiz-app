const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

// User modelini import et
const User = require('./server/models/User');

async function createAdmin() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcısı var mı kontrol et
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut:', existingAdmin.email);
      return;
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Admin kullanıcısı oluştur
    const admin = new User({
      username: 'admin',
      email: 'admin@baggage-quiz.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin kullanıcısı başarıyla oluşturuldu!');
    console.log('Email: admin@baggage-quiz.com');
    console.log('Şifre: admin123');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

createAdmin();