const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function cleanupTestUser() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Test kullanıcısını sil
    const result = await User.deleteOne({ email: 'test@example.com' });
    console.log('Test kullanıcısı silindi:', result);

    // Mevcut kullanıcıları listele
    const users = await User.find({}).select('username email role isApproved');
    console.log('Mevcut kullanıcılar:');
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

cleanupTestUser();