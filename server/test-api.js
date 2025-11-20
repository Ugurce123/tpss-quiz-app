const axios = require('axios');

async function testAPI() {
  try {
    console.log('1. Admin girişi yapılıyor...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@baggage-quiz.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Giriş başarılı:', user.username, user.role, 'Onaylı:', user.isApproved);
    
    console.log('\n2. Levels endpoint test ediliyor...');
    const levelsResponse = await axios.get('http://localhost:5001/api/levels', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Levels response:', levelsResponse.data.length, 'seviye bulundu');
    levelsResponse.data.forEach(level => {
      console.log(`- ${level.name} (Seviye ${level.level}) - Aktif: ${level.isActive}`);
    });
    
    console.log('\n3. Quiz stats test ediliyor...');
    const statsResponse = await axios.get('http://localhost:5001/api/quiz/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Stats response:', statsResponse.data);
    
    if (levelsResponse.data.length > 0) {
      const firstLevel = levelsResponse.data[0];
      console.log(`\n4. Quiz start test ediliyor (${firstLevel.name})...`);
      const quizResponse = await axios.get(`http://localhost:5001/api/quiz/start/${firstLevel._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Quiz start response:', {
        level: quizResponse.data.level?.name,
        questionCount: quizResponse.data.questions?.length
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.response?.data || error.message);
  }
}

testAPI();