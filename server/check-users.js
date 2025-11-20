const mongoose = require('mongoose');
require('dotenv').config();

// User modelini import et
const User = require('./models/User');

async function checkUsers() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Tüm kullanıcıları listele
    const users = await User.find({});
    console.log('Mevcut kullanıcılar:');
    users.forEach(user => {
      console.log(`- ID: ${user._id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });

    // Admin kullanıcılarını listele
    const admins = await User.find({ role: 'admin' });
    console.log('\nAdmin kullanıcıları:');
    admins.forEach(admin => {
      console.log(`- Username: ${admin.username}, Email: ${admin.email}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

checkUsers();