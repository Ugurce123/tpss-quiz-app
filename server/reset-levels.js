const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Level');

async function resetLevels() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Tüm seviyeleri sil
    const result = await Level.deleteMany({});
    console.log(`${result.deletedCount} seviye silindi`);

    // Index'leri kontrol et
    const indexes = await Level.collection.getIndexes();
    console.log('Mevcut indexler:', Object.keys(indexes));

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

resetLevels();