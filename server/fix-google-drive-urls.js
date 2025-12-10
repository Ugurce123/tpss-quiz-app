const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

async function fixGoogleDriveUrls() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Google Drive URL'li soruları bul
    const questions = await Question.find({
      image: { $regex: 'drive.google.com' }
    });

    console.log(`${questions.length} Google Drive URL'li soru bulundu.`);

    // Test için geçici olarak Unsplash URL'leri kullanın
    const testImages = [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'
    ];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const newImageUrl = testImages[i % testImages.length];
      
      question.image = newImageUrl;
      await question.save();
      
      console.log(`Soru ${i + 1} güncellendi: ${newImageUrl}`);
    }

    console.log('Tüm Google Drive URL\'leri test URL\'leri ile değiştirildi.');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

fixGoogleDriveUrls();