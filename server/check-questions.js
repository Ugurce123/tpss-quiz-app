const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

async function checkQuestions() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Tüm soruları getir
    const questions = await Question.find({}).select('text level image correctAnswer');
    
    console.log(`\nToplam ${questions.length} soru bulundu:\n`);
    
    questions.forEach((question, index) => {
      console.log(`${index + 1}. Soru:`);
      console.log(`   Text: ${question.text ? question.text.substring(0, 50) + '...' : 'Boş'}`);
      console.log(`   Level: ${question.level}`);
      console.log(`   Answer: ${question.correctAnswer}`);
      console.log(`   Image: ${question.image || 'Yok'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

checkQuestions();