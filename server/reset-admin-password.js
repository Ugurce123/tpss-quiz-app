const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcısını bul
    const admin = await User.findOne({ email: 'admin@baggage-quiz.com' });
    
    if (!admin) {
      console.log('Admin kullanıcısı bulunamadı!');
      return;
    }

    // Şifreyi yeniden ayarla
    admin.password = 'Ugur.Saw-123';
    await admin.save();
    
    console.log('Admin şifresi başarıyla sıfırlandı!');
    console.log('Email:', admin.email);
    console.log('Yeni Şifre: Ugur.Saw-123');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

resetAdminPassword();