const mongoose = require('mongoose');
require('dotenv').config();

// Model dosyalarını kontrol et
const fs = require('fs');
const path = require('path');

async function checkData() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Model dosyalarını listele
    const modelsDir = path.join(__dirname, 'models');
    if (fs.existsSync(modelsDir)) {
      const modelFiles = fs.readdirSync(modelsDir);
      console.log('Mevcut model dosyaları:', modelFiles);
      
      // Her model için veri sayısını kontrol et
      for (const file of modelFiles) {
        if (file.endsWith('.js')) {
          const modelName = file.replace('.js', '');
          try {
            const Model = require(`./models/${file}`);
            const count = await Model.countDocuments();
            console.log(`${modelName}: ${count} kayıt`);
          } catch (error) {
            console.log(`${modelName}: Model yüklenemedi - ${error.message}`);
          }
        }
      }
    } else {
      console.log('Models klasörü bulunamadı');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

checkData();