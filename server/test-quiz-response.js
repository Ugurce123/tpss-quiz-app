const mongoose = require('mongoose');
const Level = require('./models/Level');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/baggage-quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testQuizResponse() {
  try {
    console.log('🎯 Quiz Response Testi\n');
    
    const level = await Level.findOne({ level: 1, isActive: true });
    if (!level) {
      console.log('❌ Seviye bulunamadı');
      return;
    }
    
    const questions = await Question.find({ 
      level: level.level 
    }).select('-correctAnswer -dirtyReason');
    
    console.log('📊 Sorular:');
    console.log('='.repeat(60));
    
    questions.forEach((q, index) => {
      console.log(`\n${index + 1}. Soru:`);
      console.log(`   ID: ${q._id}`);
      console.log(`   Metin: ${q.text.substring(0, 40)}...`);
      console.log(`   Görsel: ${q.image || 'YOK'}`);
      console.log(`   dirtyOptions: ${q.dirtyOptions ? JSON.stringify(q.dirtyOptions) : 'YOK'}`);
      console.log(`   Tüm alanlar:`, Object.keys(q.toObject()));
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    mongoose.connection.close();
  }
}

testQuizResponse();