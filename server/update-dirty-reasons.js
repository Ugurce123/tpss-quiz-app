const mongoose = require('mongoose');
require('dotenv').config();

const Question = require('./models/Question');

async function updateDirtyReasons() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Eski -> Yeni mapping
    const reasonMapping = {
      'liquid_spill': 'explosive_device',
      'torn_damage': 'weapon_parts', 
      'wrong_labeling': 'sharp_objects',
      'odor_hygiene': 'martial_arts_equipment',
      'other': 'gas_bomb'
    };

    const labelMapping = {
      'explosive_device': 'Patlayıcı Madde Düzeneği (Bomba)',
      'weapon_parts': 'Silah / Silah Parçası / Mermi / Fişek',
      'sharp_objects': 'Kesici/Delici Alet',
      'martial_arts_equipment': 'Dövüş Sanatları Ekipmanı',
      'gas_bomb': 'EL / GAZ / SİS Bombası'
    };

    // Tüm soruları al
    const questions = await Question.find({});
    console.log(`${questions.length} soru bulundu`);

    let updatedCount = 0;

    for (const question of questions) {
      let needsUpdate = false;
      const updateData = {};

      // dirtyReason güncelle
      if (question.dirtyReason && reasonMapping[question.dirtyReason]) {
        updateData.dirtyReason = reasonMapping[question.dirtyReason];
        needsUpdate = true;
        console.log(`Soru ${question._id}: dirtyReason ${question.dirtyReason} -> ${updateData.dirtyReason}`);
      }

      // dirtyOptions güncelle
      if (question.dirtyOptions && question.dirtyOptions.length > 0) {
        const newDirtyOptions = question.dirtyOptions.map(option => {
          if (reasonMapping[option.value]) {
            return {
              value: reasonMapping[option.value],
              label: labelMapping[reasonMapping[option.value]]
            };
          }
          return option;
        });
        
        updateData.dirtyOptions = newDirtyOptions;
        needsUpdate = true;
        console.log(`Soru ${question._id}: dirtyOptions güncellendi`);
      }

      if (needsUpdate) {
        await Question.findByIdAndUpdate(question._id, updateData);
        updatedCount++;
      }
    }

    console.log(`${updatedCount} soru güncellendi`);

    // Güncellenmiş soruları kontrol et
    const updatedQuestions = await Question.find({ correctAnswer: 'dirty' });
    console.log('\nGüncellenmiş kirli sorular:');
    updatedQuestions.forEach(q => {
      console.log(`- ${q.text.substring(0, 50)}... | Sebep: ${q.dirtyReason} | Seçenekler: ${q.dirtyOptions?.length || 0}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

updateDirtyReasons();