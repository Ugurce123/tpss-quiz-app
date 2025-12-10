const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Level');

async function fixIndexes() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    try {
      // Yanlış index'i sil
      await Level.collection.dropIndex('levelNumber_1');
      console.log('levelNumber_1 index\'i silindi');
    } catch (error) {
      console.log('levelNumber_1 index\'i zaten yok veya silinemedi:', error.message);
    }

    // Mevcut indexleri kontrol et
    const indexes = await Level.collection.getIndexes();
    console.log('Güncel indexler:', Object.keys(indexes));

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

fixIndexes();