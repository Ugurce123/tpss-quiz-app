const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Level');
const User = require('./models/User');

async function createNewLevels() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcısını bul
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('Admin kullanıcısı bulunamadı!');
      return;
    }

    // Mevcut seviyeleri sil
    await Level.deleteMany({});
    console.log('Mevcut seviyeler silindi');

    // Yeni seviye listesi
    const levelNames = [
      'Başlangıç Seviyesi',
      'Temel Seviye',
      'Gelişen Seviye',
      'Öğrenme Aşaması',
      'Uygulama Aşaması',
      'Deneyim Kazanan',
      'Orta Öncesi Seviye',
      'Gelişim Seviyesi',
      'Uyum Aşaması',
      'Orta Seviye',
      'Orta+ Seviye',
      'Usta Adayı',
      'İleri Orta Seviye',
      'Gelişmiş Orta Seviye',
      'İleriye Geçiş Aşaması',
      'Uygulayıcı Seviye',
      'Gelişmiş Seviye',
      'Profesyonel Seviye',
      'Deneyimli Seviye',
      'Uzman Adayı',
      'Uzman Seviyesi',
      'İleri Uzman',
      'Kıdemli Uzman',
      'Teknik Uzman',
      'Baş Uzman',
      'Usta Seviyesi',
      'Kıdemli Usta',
      'Denetleyici Seviye',
      'Elit Seviye',
      'Stratejik Seviye',
      'Üst Seviye Uzman',
      'Analist Seviyesi',
      'Yönetici Adayı',
      'Yönetsel Seviye',
      'Baş Denetçi',
      'Koordinatör Seviyesi',
      'Danışman Adayı',
      'Danışman Seviyesi',
      'Kıdemli Danışman',
      'Üst Danışman',
      'Master Adayı',
      'Master Seviyesi',
      'Kıdemli Master',
      'Elit Master',
      'Baş Master',
      'Grand Seviye',
      'Elit Grand',
      'Üst Grand',
      'Usta Grand',
      'Grand Master (Son Seviye)'
    ];

    // Seviyeleri oluştur
    for (let i = 0; i < levelNames.length; i++) {
      const levelData = {
        name: levelNames[i],
        level: i + 1,
        description: `${levelNames[i]} - Bagaj güvenlik kontrolü eğitimi`,
        minScore: 0,
        maxScore: 100,
        passingScore: 70,
        timeLimit: 30,
        questionCount: 10,
        isActive: true,
        prerequisites: i === 0 ? [] : [i], // İlk seviye hariç önceki seviye gerekli
        rewards: {
          points: (i + 1) * 50, // Her seviye için artan puan
          badge: `${levelNames[i]} Rozeti`
        },
        createdBy: admin._id
      };

      const level = new Level(levelData);
      await level.save();
      console.log(`Seviye ${i + 1} oluşturuldu: ${levelNames[i]}`);
    }

    console.log(`\n${levelNames.length} seviye başarıyla oluşturuldu!`);

    // Tüm kullanıcıların ilerlemesini sıfırla
    await User.updateMany(
      { role: 'user' },
      { 
        $set: { 
          currentLevel: 1,
          completedLevels: []
        }
      }
    );

    console.log('Kullanıcı ilerlemeleri sıfırlandı');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

createNewLevels();