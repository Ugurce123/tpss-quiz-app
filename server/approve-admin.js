const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function approveAdmin() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcısını onaylı yap
    const result = await User.updateOne(
      { role: 'admin' },
      { 
        $set: { 
          isApproved: true,
          approvedAt: new Date()
        }
      }
    );

    console.log('Admin onay durumu güncellendi:', result);

    // Güncellenmiş admin kullanıcısını kontrol et
    const admin = await User.findOne({ role: 'admin' });
    console.log('Admin durumu:', {
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isApproved: admin.isApproved
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

approveAdmin();