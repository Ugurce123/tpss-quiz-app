const mongoose = require('mongoose');
const Question = require('./models/Question');
const User = require('./models/User');
require('dotenv').config();

async function testGooglePhotos() {
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

    // Google Photos URL'sinden photo ID'yi çıkar
    const googlePhotosUrl = 'https://photos.google.com/u/1/search/CgAiCBIGCgRyAgoAKJnAubiwMw%3D%3D/photo/AF1QipMVG2-vU-6VzljXVswf0LZdl-rWMGihE7E64EA';
    const photoMatch = googlePhotosUrl.match(/photo\/([A-Za-z0-9_-]+)/);
    
    if (photoMatch && photoMatch[1]) {
      const photoId = photoMatch[1];
      const directUrl = `https://lh3.googleusercontent.com/${photoId}=w500-h400`;
      
      console.log('Google Photos URL:', googlePhotosUrl);
      console.log('Photo ID:', photoId);
      console.log('Direct URL:', directUrl);

      // İlk soruyu güncelle
      const question = await Question.findOne({ level: 1 });
      if (question) {
        question.image = directUrl;
        await question.save();
        console.log('Test sorusu güncellendi:');
        console.log('Soru ID:', question._id);
        console.log('Yeni görsel URL:', question.image);
      } else {
        console.log('Güncellenecek soru bulunamadı!');
      }
    } else {
      console.log('Google Photos URL\'sinden photo ID çıkarılamadı!');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

testGooglePhotos();