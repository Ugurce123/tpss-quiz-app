const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/baggage-quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkLatestQuestion() {
  try {
    console.log('🔍 En son oluşturulan soru kontrol ediliyor...\n');
    
    const question = await Question.findOne().sort({ createdAt: -1 });
    
    if (!question) {
      console.log('❌ Hiç soru bulunamadı');
      return;
    }
    
    console.log('📝 En son soru:');
    console.log('='.repeat(60));
    console.log(`ID: ${question._id}`);
    console.log(`Metin: ${question.text}`);
    console.log(`Seviye: ${question.level}`);
    console.log(`Görsel: ${question.image || 'YOK'}`);
    console.log(`Aktif: ${question.isActive}`);
    console.log(`Oluşturulma: ${question.createdAt}`);
    console.log(`Güncellenme: ${question.updatedAt}`);
    
    if (question.image) {
      console.log(`\n🖼️  Görsel Detayları:`);
      console.log(`Görsel Tipi: ${
        question.image.startsWith('data:') ? 'Base64 Data URL' :
        question.image.startsWith('http') ? 'HTTP URL' :
        question.image.startsWith('/uploads/') ? 'Server File Path' :
        'Unknown'
      }`);
      
      // Dosya var mı kontrol et
      if (question.image.startsWith('/uploads/')) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'uploads', question.image.replace('/uploads/', ''));
        const exists = fs.existsSync(filePath);
        console.log(`Dosya Var: ${exists ? 'Evet ✅' : 'Hayır ❌'}`);
        if (exists) {
          const stats = fs.statSync(filePath);
          console.log(`Dosya Boyutu: ${(stats.size / 1024).toFixed(1)} KB`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkLatestQuestion();