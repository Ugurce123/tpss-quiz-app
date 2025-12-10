const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function fixAdminPassword() {
  try {
    console.log('🔗 MongoDB bağlantısı kuruluyor...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // Admin kullanıcısını bul
    const admin = await User.findOne({ email: 'admin@baggage-quiz.com' });
    
    if (!admin) {
      console.log('❌ Admin kullanıcısı bulunamadı!');
      return;
    }

    console.log('📝 Mevcut admin bilgileri:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}\n`);

    // Yeni şifreyi oluştur
    const newPassword = 'Ugur.Saw-123';
    console.log('🔐 Yeni şifre oluşturuluyor...');
    
    // Şifreyi hashle - bcryptjs kullan
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('✅ Şifre hashlendi\n');

    // Test et
    const testMatch = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`🧪 Hash testi: ${testMatch ? '✅ BAŞARILI' : '❌ BAŞARISIZ'}\n`);

    if (!testMatch) {
      console.log('❌ Hash testi başarısız! İşlem iptal ediliyor.');
      return;
    }

    // Şifreyi güncelle
    admin.password = hashedPassword;
    await admin.save();

    console.log('✅ Admin şifresi başarıyla güncellendi!\n');
    
    // Doğrulama
    const updatedAdmin = await User.findOne({ email: 'admin@baggage-quiz.com' });
    const finalTest = await bcrypt.compare(newPassword, updatedAdmin.password);
    
    console.log('🔍 Final doğrulama:');
    console.log(`   Şifre eşleşmesi: ${finalTest ? '✅ DOĞRU' : '❌ YANLIŞ'}\n`);

    if (finalTest) {
      console.log('🎉 Giriş bilgileri:');
      console.log('   Username: admin@baggage-quiz.com');
      console.log('   Password: Ugur.Saw-123');
      console.log('\n✅ Artık bu bilgilerle giriş yapabilirsiniz!');
    } else {
      console.log('❌ Bir sorun var, lütfen tekrar deneyin.');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
  }
}

fixAdminPassword()
  .then(() => {
    console.log('🎉 İşlem tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ İşlem hatası:', error);
    process.exit(1);
  });