const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Level = require('./models/Level');

async function checkUserProgress() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Tüm kullanıcıları kontrol et
    const users = await User.find({ role: 'user' });
    console.log('Kullanıcı ilerlemeleri:');
    
    for (const user of users) {
      console.log(`\n--- ${user.username} (${user.email}) ---`);
      console.log(`Mevcut Seviye: ${user.currentLevel}`);
      console.log(`Onaylı: ${user.isApproved}`);
      console.log(`Tamamlanan Seviyeler: ${user.completedLevels?.length || 0}`);
      
      if (user.completedLevels && user.completedLevels.length > 0) {
        user.completedLevels.forEach(cl => {
          console.log(`  - Seviye ${cl.level}: %${cl.score} (${new Date(cl.completedAt).toLocaleDateString('tr-TR')})`);
        });
      }
    }

    // Seviyeleri kontrol et
    console.log('\n--- Seviye Bilgileri ---');
    const levels = await Level.find().sort({ level: 1 });
    levels.forEach(level => {
      console.log(`Seviye ${level.level}: ${level.name} - Geçme Puanı: %${level.passingScore}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB bağlantısı kapatıldı');
  }
}

checkUserProgress();