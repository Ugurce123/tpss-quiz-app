const mongoose = require('mongoose');
const Question = require('./models/Question');
const User = require('./models/User');
require('dotenv').config();

async function testSpecificUrl() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Test URL'si
    const googlePhotosUrl = 'https://photos.google.com/u/1/search/CgAiCBIGCgRyAgoAKJnAubiwMw%3D%3D/photo/AF1QipMVG2-vU-6VzljXVswf0LZdl-rWMGihE7E64EA';
    
    console.log('🔍 Test edilen URL:', googlePhotosUrl);
    
    // Photo ID'yi çıkar
    const photoMatch = googlePhotosUrl.match(/photo\/([A-Za-z0-9_-]+)/);
    
    if (photoMatch && photoMatch[1]) {
      const photoId = photoMatch[1];
      const directUrl = `https://lh3.googleusercontent.com/${photoId}=w500-h400`;
      
      console.log('✅ Photo ID bulundu:', photoId);
      console.log('✅ Dönüştürülen URL:', directUrl);

      // Admin kullanıcısını bul
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) {
        console.log('❌ Admin kullanıcısı bulunamadı!');
        return;
      }

      // Yeni test sorusu oluştur
      const testQuestion = new Question({
        text: 'Bu bagajda güvenlik açısından sorunlu bir eşya var mı? (Google Photos Test)',
        correctAnswer: 'dirty',
        level: 1,
        points: 10,
        explanation: 'Bu soru Google Photos URL testi için oluşturulmuştur.',
        difficulty: 'easy',
        category: 'test',
        image: directUrl,
        dirtyReason: 'sharp_objects',
        dirtyOptions: [
          { value: 'sharp_objects', label: 'Kesici/Delici Alet' },
          { value: 'weapon_parts', label: 'Silah / Silah Parçası / Mermi / Fişek' }
        ],
        createdBy: admin._id,
        isActive: true
      });

      await testQuestion.save();
      
      console.log('✅ Test sorusu oluşturuldu!');
      console.log('📝 Soru ID:', testQuestion._id);
      console.log('🖼️ Görsel URL:', testQuestion.image);
      console.log('📊 Level:', testQuestion.level);
      console.log('✨ Aktif:', testQuestion.isActive);

    } else {
      console.log('❌ Photo ID çıkarılamadı!');
      console.log('🔍 URL formatı kontrol ediliyor...');
      
      // URL'yi parçalara ayırarak debug yapalım
      console.log('URL uzunluğu:', googlePhotosUrl.length);
      console.log('photo/ içeriyor mu:', googlePhotosUrl.includes('photo/'));
      
      if (googlePhotosUrl.includes('photo/')) {
        const parts = googlePhotosUrl.split('photo/');
        console.log('photo/ sonrası:', parts[1]);
      }
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

testSpecificUrl();