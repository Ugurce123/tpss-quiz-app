const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb://localhost:27017/baggage-quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testQuizEndpoint() {
  try {
    console.log('🎯 Quiz Endpoint Testi\n');
    
    // Test user'ı bul
    const user = await User.findOne({ username: 'yenı1' });
    if (!user) {
      console.log('❌ Test user bulunamadı');
      return;
    }
    
    console.log(`✅ User bulundu: ${user.username}`);
    console.log(`   Onaylı: ${user.isApproved}`);
    console.log(`   Mevcut Seviye: ${user.currentLevel}\n`);
    
    // Token oluştur
    const token = jwt.sign(
      { userId: user._id },
      'BaggageQuiz2024!SecureKey#RandomString$VeryLongAndComplex&Token@Security',
      { expiresIn: '24h' }
    );
    
    console.log('🔑 Token oluşturuldu\n');
    
    // Quiz endpoint'ini çağır
    const response = await axios.get('http://localhost:5001/api/quiz/start/68fb167b98fc4e3ecc00bb50', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Quiz Response:');
    console.log('='.repeat(60));
    console.log(`Seviye: ${response.data.level.name}`);
    console.log(`Soru Sayısı: ${response.data.questions.length}`);
    console.log(`Görselli Sorular: ${response.data.questions.filter(q => q.image).length}\n`);
    
    console.log('📝 İlk 3 sorunun detayları:');
    console.log('='.repeat(60));
    
    response.data.questions.slice(0, 3).forEach((q, index) => {
      console.log(`\n${index + 1}. Soru:`);
      console.log(`   ID: ${q._id}`);
      console.log(`   Metin: ${q.text.substring(0, 40)}...`);
      console.log(`   Görsel: ${q.image || 'YOK'}`);
      
      if (q.image) {
        console.log(`   Görsel Tipi: ${
          q.image.startsWith('data:') ? 'Base64' :
          q.image.startsWith('http') ? 'HTTP URL' :
          q.image.startsWith('/uploads/') ? 'Server File' :
          'Unknown'
        }`);
        
        // Görsel URL'sini oluştur
        let imageUrl;
        if (q.image.startsWith('data:') || q.image.startsWith('http')) {
          imageUrl = q.image;
        } else if (q.image.startsWith('/uploads/')) {
          imageUrl = `http://localhost:5001${q.image}`;
        } else {
          imageUrl = `http://localhost:5001/uploads/${q.image}`;
        }
        console.log(`   Tam URL: ${imageUrl}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.response?.data || error.message);
  } finally {
    mongoose.connection.close();
  }
}

testQuizEndpoint();