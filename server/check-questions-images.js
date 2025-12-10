const mongoose = require('mongoose');
const Question = require('./models/Question');

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/baggage-quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkQuestionsImages() {
  try {
    console.log('🔍 Sorular kontrol ediliyor...\n');
    
    const questions = await Question.find().sort({ createdAt: -1 });
    
    console.log(`📊 Toplam ${questions.length} soru bulundu\n`);
    
    const withImages = questions.filter(q => q.image);
    const withoutImages = questions.filter(q => !q.image);
    
    console.log(`🖼️  Görselli sorular: ${withImages.length}`);
    console.log(`📝 Görselsiz sorular: ${withoutImages.length}\n`);
    
    if (withImages.length > 0) {
      console.log('🖼️  Görselli sorular:');
      console.log('='.repeat(50));
      
      withImages.slice(0, 10).forEach((q, index) => {
        console.log(`${index + 1}. Soru ID: ${q._id}`);
        console.log(`   Metin: ${q.text.substring(0, 50)}...`);
        console.log(`   Seviye: ${q.level}`);
        console.log(`   Görsel: ${q.image}`);
        console.log(`   Görsel Tipi: ${
          q.image.startsWith('data:') ? 'Base64 Data URL' :
          q.image.startsWith('http') ? 'HTTP URL' :
          q.image.startsWith('/uploads/') ? 'Server File Path' :
          'Unknown'
        }`);
        console.log(`   Aktif: ${q.isActive}`);
        console.log('');
      });
      
      if (withImages.length > 10) {
        console.log(`... ve ${withImages.length - 10} görsel daha\n`);
      }
    }
    
    if (withoutImages.length > 0) {
      console.log('📝 Görselsiz sorular (ilk 5):');
      console.log('='.repeat(50));
      
      withoutImages.slice(0, 5).forEach((q, index) => {
        console.log(`${index + 1}. Soru ID: ${q._id}`);
        console.log(`   Metin: ${q.text.substring(0, 50)}...`);
        console.log(`   Seviye: ${q.level}`);
        console.log(`   Aktif: ${q.isActive}`);
        console.log('');
      });
    }
    
    // Seviye bazında analiz
    console.log('📊 Seviye bazında analiz:');
    console.log('='.repeat(50));
    
    const levelStats = {};
    questions.forEach(q => {
      if (!levelStats[q.level]) {
        levelStats[q.level] = { total: 0, withImages: 0, active: 0 };
      }
      levelStats[q.level].total++;
      if (q.image) levelStats[q.level].withImages++;
      if (q.isActive) levelStats[q.level].active++;
    });
    
    Object.keys(levelStats).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
      const stats = levelStats[level];
      console.log(`Seviye ${level}: ${stats.total} soru, ${stats.withImages} görselli, ${stats.active} aktif`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkQuestionsImages();