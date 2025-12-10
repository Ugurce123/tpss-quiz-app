const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function resetUserProgress() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Tüm kullanıcıların ilerlemesini sıfırla (admin hariç)
    const result = await User.updateMany(
      { role: 'user' },
      { 
        $set: { 
          currentLevel: 1,
          completedLevels: []
        }
      }
    );

    console.log(`${result.modifiedCount} kullanıcının ilerlemesi sıfırlandı`);

    // Güncellenmiş kullanıcıları kontrol et
    const users = await User.find({ role: 'user' });
    console.log('Sıfırlanmış kullanıcılar:');
    users.forEach(user => {
      console.log(`- ${user.username}: Seviye ${user.currentLevel}, Tamamlanan: ${user.completedLevels.length}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

resetUserProgress();