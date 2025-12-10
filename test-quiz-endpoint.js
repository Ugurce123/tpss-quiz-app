const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001';

// Test token (you'll need to get a real one from login)
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzU4MzY5YzY5YzY5YzY5YzY5YzY5YzYiLCJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoidXNlciIsImlzQXBwcm92ZWQiOnRydWUsImlhdCI6MTczMzgyNDgwMH0.test';

async function testQuizEndpoint() {
  try {
    console.log('🎯 Quiz endpoint testi başlıyor...\n');
    
    // 1. Önce levels endpoint'ini test et
    console.log('📊 Levels endpoint testi...');
    const levelsResponse = await axios.get(`${API_BASE_URL}/api/levels`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log(`✅ ${levelsResponse.data.length} seviye bulundu`);
    const firstLevel = levelsResponse.data[0];
    console.log(`🎯 Test için seviye: ${firstLevel.name} (ID: ${firstLevel._id})\n`);
    
    // 2. Quiz start endpoint'ini test et
    console.log('🚀 Quiz start endpoint testi...');
    const quizResponse = await axios.get(`${API_BASE_URL}/api/quiz/start/${firstLevel._id}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log('✅ Quiz başarıyla başlatıldı!');
    console.log(`📊 Seviye: ${quizResponse.data.level.name}`);
    console.log(`❓ Soru sayısı: ${quizResponse.data.questions.length}`);
    console.log(`🖼️  Görselli soru sayısı: ${quizResponse.data.questions.filter(q => q.image).length}\n`);
    
    // 3. İlk birkaç sorunun görsel bilgilerini kontrol et
    console.log('🖼️  İlk 3 sorunun görsel bilgileri:');
    console.log('='.repeat(50));
    
    quizResponse.data.questions.slice(0, 3).forEach((question, index) => {
      console.log(`${index + 1}. Soru:`);
      console.log(`   ID: ${question._id}`);
      console.log(`   Metin: ${question.text.substring(0, 50)}...`);
      console.log(`   Görsel: ${question.image || 'YOK'}`);
      if (question.image) {
        console.log(`   Görsel Tipi: ${
          question.image.startsWith('data:') ? 'Base64 Data URL' :
          question.image.startsWith('http') ? 'HTTP URL' :
          question.image.startsWith('/uploads/') ? 'Server File Path' :
          'Unknown'
        }`);
        
        // Görsel URL'sini oluştur
        let imageUrl;
        if (question.image.startsWith('data:') || question.image.startsWith('http')) {
          imageUrl = question.image;
        } else if (question.image.startsWith('/uploads/')) {
          imageUrl = `${API_BASE_URL}${question.image}`;
        } else {
          imageUrl = `${API_BASE_URL}/uploads/${question.image}`;
        }
        console.log(`   Tam URL: ${imageUrl}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Test hatası:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Token geçersiz olabilir. Gerçek bir token ile test edin.');
    }
  }
}

testQuizEndpoint();