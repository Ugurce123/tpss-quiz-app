const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // server/.env dosyasını kullan

const User = require('./models/User');

async function createProductionAdmin() {
  try {
    console.log('🔗 MongoDB bağlantısı kuruluyor...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Ayarlı ✅' : 'Ayarlı değil ❌');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // Önce mevcut admin'i kontrol et
    const existingAdmin = await User.findOne({ email: 'admin@baggage-quiz.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin kullanıcısı zaten mevcut!');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('\n🔄 Şifreyi güncelliyorum...\n');
      
      // Şifreyi güncelle
      existingAdmin.password = 'Ugur.Saw-123';
      existingAdmin.isApproved = true;
      existingAdmin.isBlocked = false;
      await existingAdmin.save();
      
      console.log('✅ Admin şifresi güncellendi!');
    } else {
      console.log('📝 Yeni admin kullanıcısı oluşturuluyor...\n');
      
      const adminUser = new User({
        username: 'admin',
        email: 'admin@baggage-quiz.com',
        password: 'Ugur.Saw-123', // Model middleware otomatik hashleyecek
        role: 'admin',
        isApproved: true,
        isBlocked: false,
        currentLevel: 1,
        completedLevels: [],
        testHistory: [],
        ipAddresses: []
      });

      await adminUser.save();
      console.log('✅ Admin kullanıcısı oluşturuldu!');
    }

    // Doğrulama
    const admin = await User.findOne({ email: 'admin@baggage-quiz.com' });
    console.log('\n📊 Admin Kullanıcı Bilgileri:');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Approved: ${admin.isApproved}`);
    console.log(`   Blocked: ${admin.isBlocked}`);
    
    // Şifre testi
    console.log('\n🔐 Şifre testi yapılıyor...');
    const isPasswordCorrect = await admin.comparePassword('Ugur.Saw-123');
    console.log(`   Şifre doğrulaması: ${isPasswordCorrect ? '✅ BAŞARILI' : '❌ BAŞARISIZ'}`);
    
    if (isPasswordCorrect) {
      console.log('\n🎉 Admin kullanıcısı hazır! Artık giriş yapabilirsiniz:');
      console.log('   Email: admin@baggage-quiz.com');
      console.log('   Password: Ugur.Saw-123');
    } else {
      console.log('\n⚠️  Şifre doğrulaması başarısız! Lütfen tekrar deneyin.');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
  }
}

createProductionAdmin()
  .then(() => {
    console.log('\n✅ İşlem tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ İşlem başarısız:', error.message);
    process.exit(1);
  });
