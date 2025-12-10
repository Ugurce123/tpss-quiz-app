const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

async function cleanQuestions() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Boş text veya undefined correctAnswer olan soruları bul
    const invalidQuestions = await Question.find({
      $or: [
        { text: { $exists: false } },
        { text: null },
        { text: '' },
        { correctAnswer: { $exists: false } },
        { correctAnswer: null },
        { correctAnswer: undefined }
      ]
    });

    console.log(`${invalidQuestions.length} geçersiz soru bulundu.`);

    if (invalidQuestions.length > 0) {
      // Geçersiz soruları sil
      const result = await Question.deleteMany({
        $or: [
          { text: { $exists: false } },
          { text: null },
          { text: '' },
          { correctAnswer: { $exists: false } },
          { correctAnswer: null },
          { correctAnswer: undefined }
        ]
      });

      console.log(`${result.deletedCount} geçersiz soru silindi.`);
    }

    // Kalan soruları kontrol et
    const remainingQuestions = await Question.countDocuments();
    console.log(`Kalan geçerli soru sayısı: ${remainingQuestions}`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

cleanQuestions();