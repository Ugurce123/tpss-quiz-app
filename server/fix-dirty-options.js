const mongoose = require('mongoose');
require('dotenv').config();

const Question = require('./models/Question');

async function fixDirtyOptions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Tüm soruları al
    const questions = await Question.find({});
    console.log(`${questions.length} soru bulundu`);

    // Kirli seçenekler
    const dirtyOptionsMap = {
      'explosive_device': 'Patlayıcı Madde',
      'weapon_parts': 'Silah Parçaları', 
      'sharp_objects': 'Kesici Aletler',
      'martial_arts_equipment': 'Dövüş Malzemeleri',
      'gas_bomb': 'Gaz Bombası'
    };

    for (const question of questions) {
      // Eğer dirtyOptions boş veya sadece _id içeriyorsa düzelt
      if (!question.dirtyOptions || question.dirtyOptions.length === 0 || 
          !question.dirtyOptions[0].value) {
        
        // Varsayılan kirli seçenekleri ekle
        question.dirtyOptions = [
          { value: 'explosive_device', label: 'Patlayıcı Madde' },
          { value: 'weapon_parts', label: 'Silah Parçaları' },
          { value: 'sharp_objects', label: 'Kesici Aletler' },
          { value: 'martial_arts_equipment', label: 'Dövüş Malzemeleri' },
          { value: 'gas_bomb', label: 'Gaz Bombası' }
        ];

        await Question.updateOne(
          { _id: question._id },
          { $set: { dirtyOptions: question.dirtyOptions } }
        );
        console.log(`Soru ${question._id} güncellendi`);
      }
    }

    console.log('Tüm sorular güncellendi!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

fixDirtyOptions();