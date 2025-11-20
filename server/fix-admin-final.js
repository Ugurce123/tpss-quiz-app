const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function fixAdminFinal() {
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

    // Yeni şifreyi ayarla - Model'deki pre-save middleware otomatik hashleyecek
    const newPassword = 'Ugur.Saw-123';
    console.log('🔐 Yeni şifre ayarlanıyor...');
    
    admin.password = newPassword; // Plain text olarak ayarla, middleware hashleyecek
    await admin.save(); // save() çağrıldığında pre-save middleware çalışacak

    console.log('✅ Admin şifresi başarıyla güncellendi!\n');
    
    // Doğrulama
    const updatedAdmin = await User.findOne({ email: 'admin@baggage-quiz.com' });
    const isMatch = await updatedAdmin.comparePassword(newPassword);
    
    console.log('🔍 Final doğrulama:');
    console.log(`   Şifre eşleşmesi: ${isMatch ? '✅ DOĞRU' : '❌ YANLIŞ'}\n`);

    if (isMatch) {
      console.log('🎉 GİRİŞ BİLGİLERİ:');
      console.log('   ==================');
      console.log('   Username: admin@baggage-quiz.com');
      console.log('   Password: Ugur.Saw-123');
      console.log('   ==================');
      console.log('\n✅ Artık bu bilgilerle giriş yapabilirsiniz!');
      console.log('🌐 Login: http://localhost:3000/login');
    } else {
      console.log('❌ Hala bir sorun var!');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
  }
}

fixAdminFinal()
  .then(() => {
    console.log('🎉 İşlem tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ İşlem hatası:', error);
    process.exit(1);
  });