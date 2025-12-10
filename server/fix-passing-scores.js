const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Level');

async function fixPassingScores() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Tüm seviyelerin geçme puanını %70 yap
    const result = await Level.updateMany(
      {},
      { $set: { passingScore: 70 } }
    );

    console.log(`${result.modifiedCount} seviye güncellendi`);

    // Güncellenmiş seviyeleri kontrol et
    const levels = await Level.find().sort({ level: 1 });
    console.log('Güncellenmiş seviyeler:');
    levels.forEach(level => {
      console.log(`Seviye ${level.level}: ${level.name} - Geçme Puanı: %${level.passingScore}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

fixPassingScores();