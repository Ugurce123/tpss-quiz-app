const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function approveAllUsers() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Tüm kullanıcıları onayla
    const result = await User.updateMany(
      { role: 'user' },
      { 
        $set: { 
          isApproved: true,
          approvedAt: new Date()
        }
      }
    );

    console.log('Kullanıcı onay durumu güncellendi:', result);

    // Güncellenmiş kullanıcıları kontrol et
    const users = await User.find({}).select('username email role isApproved');
    console.log('Kullanıcı durumları:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role} - Onaylı: ${user.isApproved}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

approveAllUsers();