const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Level');
const Question = require('./models/Question');

async function checkLevels() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Seviyeleri listele
    const levels = await Level.find({ isActive: true }).sort({ level: 1 });
    console.log('Aktif seviyeler:');
    
    for (const level of levels) {
      const questionCount = await Question.countDocuments({ 
        level: level.level, 
        isActive: true 
      });
      
      console.log(`- ${level.name} (ID: ${level._id}, Level: ${level.level}) - ${questionCount} soru`);
    }

    // Sorular seviye dağılımı
    console.log('\nSorular seviye dağılımı:');
    const questionsByLevel = await Question.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    questionsByLevel.forEach(item => {
      console.log(`Seviye ${item._id}: ${item.count} soru`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

checkLevels();