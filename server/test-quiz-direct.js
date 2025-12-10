const mongoose = require('mongoose');
const Level = require('./models/Level');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/baggage-quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testQuiz() {
  try {
    console.log('🎯 Quiz endpoint testi başlıyor...\n');
    
    // 1. Levels'i getir
    const levels = await Level.find({ isActive: true });
    console.log(`📊 ${levels.length} aktif seviye bulundu`);
    
    if (levels.length === 0) {
      console.log('❌ Hiç aktif seviye yok!');
      return;
    }
    
    const level = levels[0];
    console.log(`🎯 Test seviyesi: ${level.name} (Level ${level.level})\n`);
    
    // 2. Bu seviyenin sorularını getir
    const questions = await Question.find({ 
      level: level.level 
    }).select('-correctAnswer -dirtyReason');
    
    console.log(`❓ ${questions.length} soru bulundu`);
    console.log(`🖼️  Görselli sorular: ${questions.filter(q => q.image).length}\n`);
    
    // 3. İlk 3 soruyu detaylı kontrol et
    console.log('📝 İlk 3 sorunun detayları:');
    console.log('='.repeat(60));
    
    questions.slice(0, 3).forEach((q, index) => {
      console.log(`\n${index + 1}. Soru:`);
      console.log(`   ID: ${q._id}`);
      console.log(`   Metin: ${q.text.substring(0, 60)}...`);
      console.log(`   Seviye: ${q.level}`);
      console.log(`   Aktif: ${q.isActive}`);
      console.log(`   Görsel: ${q.image || 'YOK'}`);
      
      if (q.image) {
        console.log(`   Görsel Tipi: ${
          q.image.startsWith('data:') ? 'Base64 Data URL' :
          q.image.startsWith('http') ? 'HTTP URL' :
          q.image.startsWith('/uploads/') ? 'Server File Path' :
          'Unknown'
        }`);
      }
      
      console.log(`   Doğru Cevap: ${q.correctAnswer}`);
      if (q.correctAnswer === 'dirty') {
        console.log(`   Kirli Sebebi: ${q.dirtyReason}`);
        console.log(`   Seçenekler: ${q.dirtyOptions?.length || 0}`);
      }
    });
    
    // 4. Quiz response'unu simüle et
    console.log('\n\n📤 Quiz Response Simülasyonu:');
    console.log('='.repeat(60));
    
    const quizResponse = {
      level: {
        _id: level._id,
        name: level.name,
        level: level.level,
        passingScore: level.passingScore
      },
      questions: questions,
      totalQuestions: questions.length
    };
    
    console.log(JSON.stringify({
      level: quizResponse.level,
      totalQuestions: quizResponse.totalQuestions,
      questionsWithImages: quizResponse.questions.filter(q => q.image).length,
      firstQuestion: {
        id: quizResponse.questions[0]?._id,
        text: quizResponse.questions[0]?.text.substring(0, 50),
        image: quizResponse.questions[0]?.image
      }
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    mongoose.connection.close();
  }
}

testQuiz();