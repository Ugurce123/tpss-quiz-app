const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function updateAdminPassword() {
  try {
    console.log('🔗 MongoDB bağlantısı kuruluyor...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('✅ MongoDB bağlantısı başarılı');

    // Admin kullanıcısını bul
    const admin = await User.findOne({ role: 'admin', username: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin kullanıcısı bulunamadı!');
      return;
    }

    console.log(`📝 Admin kullanıcısı bulundu: ${admin.username} (${admin.email})`);

    // Yeni şifreyi hashle
    const newPassword = 'Ugur.Saw-123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Şifreyi güncelle
    admin.password = hashedPassword;
    await admin.save();

    console.log('✅ Admin şifresi başarıyla güncellendi!');
    console.log('');
    console.log('🔐 Yeni Giriş Bilgileri:');
    console.log('   Username: admin@baggage-quiz.com');
    console.log('   Password: Ugur.Saw-123');
    console.log('');
    console.log('⚠️  Bu şifreyi güvenli bir yerde saklayın!');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
updateAdminPassword()
  .then(() => {
    console.log('🎉 İşlem tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ İşlem hatası:', error);
    process.exit(1);
  });