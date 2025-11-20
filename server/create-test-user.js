const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function createTestUser() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Test kullanıcısı oluştur
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123',
      role: 'user'
      // isApproved: false (default)
    });

    await testUser.save();
    console.log('Test kullanıcısı oluşturuldu!');
    console.log('Email: test@example.com');
    console.log('Şifre: test123');
    console.log('Onay durumu:', testUser.isApproved);

  } catch (error) {
    if (error.code === 11000) {
      console.log('Test kullanıcısı zaten mevcut');
    } else {
      console.error('Hata:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

createTestUser();