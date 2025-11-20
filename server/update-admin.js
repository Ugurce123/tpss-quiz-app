const mongoose = require('mongoose');
require('dotenv').config();

// User modelini import et
const User = require('./models/User');

async function updateAdmin() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcısını güncelle
    const result = await User.updateOne(
      { username: 'admin', role: 'admin' },
      { 
        $set: { 
          email: 'admin@baggage-quiz.com'
        }
      }
    );

    console.log('Güncelleme sonucu:', result);

    // Güncellenmiş admin kullanıcısını kontrol et
    const admin = await User.findOne({ username: 'admin', role: 'admin' });
    console.log('Güncellenmiş admin:', {
      username: admin.username,
      email: admin.email,
      role: admin.role
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

updateAdmin();