const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function checkAdminUser() {
  try {
    console.log('🔗 MongoDB bağlantısı kuruluyor...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // Tüm admin kullanıcılarını bul
    const admins = await User.find({ role: 'admin' });
    
    console.log(`📊 Toplam ${admins.length} admin kullanıcısı bulundu:\n`);
    
    admins.forEach((admin, index) => {
      console.log(`Admin ${index + 1}:`);
      console.log(`  ID: ${admin._id}`);
      console.log(`  Username: ${admin.username}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  Approved: ${admin.isApproved}`);
      console.log(`  Password Hash: ${admin.password.substring(0, 20)}...`);
      console.log('');
    });

    // Test şifresi
    console.log('🔐 Şifre testi yapılıyor...\n');
    const testPassword = 'Ugur.Saw-123';
    
    for (const admin of admins) {
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      console.log(`${admin.username}: Şifre eşleşmesi = ${isMatch ? '✅ DOĞRU' : '❌ YANLIŞ'}`);
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
  }
}

checkAdminUser()
  .then(() => {
    console.log('🎉 Kontrol tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Kontrol hatası:', error);
    process.exit(1);
  });