const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

async function addTestImages() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Test görselleri - Bagaj X-ray görüntüleri benzeri
    const testImages = [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop', // Bagaj
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop', // Valiz
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop', // Seyahat çantası
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&h=400&fit=crop', // Bavul
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=400&fit=crop', // Çanta
      'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=500&h=400&fit=crop', // Sırt çantası
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop&sat=-50', // Gri tonlu bagaj
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop&sat=-30', // Gri tonlu valiz
    ];

    // Tüm soruları getir
    const questions = await Question.find({}).sort({ level: 1 });
    
    console.log(`${questions.length} soru bulundu.`);

    // Her soruya rastgele bir test görseli ata
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const randomImage = testImages[i % testImages.length];
      
      question.image = randomImage;
      await question.save();
      
      console.log(`Soru ${i + 1} (Level ${question.level}): ${randomImage}`);
    }

    console.log('Tüm sorulara test görselleri atandı.');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

addTestImages();