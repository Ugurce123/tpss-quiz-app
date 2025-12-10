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
    
  } catch (error) {
    console.error('❌ Hata:', error.response?.data || error.message);
  }
}

testAPI();