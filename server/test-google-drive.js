const mongoose = require('mongoose');
const Question = require('./models/Question');
const User = require('./models/User');
require('dotenv').config();

async function testGoogleDrive() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcısını bul
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('Admin kullanıcısı bulunamadı!');
      return;
    }

    // Test için genel bir görsel URL'si kullanın (public domain)
    const testImageUrl = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop';

    // Mevcut bir soruyu güncelle
    const question = await Question.findOne({ level: 1 });
    if (question) {
      question.image = testImageUrl;
      await question.save();
      console.log('Test sorusu güncellendi:');
      console.log('Soru ID:', question._id);
      console.log('Yeni görsel URL:', question.image);
    } else {
      console.log('Güncellenecek soru bulunamadı!');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

testGoogleDrive();