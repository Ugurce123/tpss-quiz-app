const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Level');
const User = require('./models/User');

async function updateLevelNames() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/baggage-quiz');
    console.log('MongoDB bağlantısı başarılı');

    // Admin kullanıcısını bul
    const admin = await User.findOne({ role: 'admin' });

    // Mevcut seviyeleri sil
    await Level.deleteMany({});
    console.log('Mevcut seviyeler silindi');

    // Yeni seviye listesi (50 seviye)
    const levelGroups = [
      {
        groupName: 'Temel Gelişim Aşamaları',
        levels: [
          'Başlangıç Seviyesi', 'Temel Seviye', 'Gelişen Seviye', 'Öğrenme Aşaması', 
          'Uygulama Aşaması', 'Deneyim Kazanan', 'Hazırlık Seviyesi', 'Pratik Seviyesi', 
          'Yetkinlik Öncesi', 'Yetkin Seviye'
        ]
      },
      {
        groupName: 'Orta Düzey Aşamalar',
        levels: [
          'Orta Seviye', 'Usta Adayı', 'İleri Orta Seviye', 'Uygulayıcı Seviye', 
          'Kapsamlı Seviye', 'Deneyimli Seviye', 'Stratejik Seviye', 'Analitik Seviye', 
          'Gelişmiş Seviye', 'Profesyonel Seviye'
        ]
      },
      {
        groupName: 'İleri Düzey Aşamalar',
        levels: [
          'İleri Seviye', 'Uzman Adayı', 'Teknik Uzman', 'Alan Uzmanı', 'Kıdemli Uzman', 
          'Yüksek Uzman', 'Sistematik Uzman', 'Baş Uzman', 'Mentor Seviyesi', 'Uygulama Lideri', 
          'Takım Lideri', 'Operasyonel Uzman', 'Stratejik Uzman', 'Yönlendirici Uzman', 'Üst Düzey Uzman'
        ]
      },
      {
        groupName: 'Üst Uzmanlık ve Ustalık Aşamaları',
        levels: [
          'Uzmanlık Ustası', 'Kıdemli Usta', 'Elit Usta', 'Denetleyici Usta', 'Baş Usta', 
          'Sistem Ustası', 'Eğitimci Usta', 'Denetmen Seviyesi', 'Değerlendirici Seviyesi', 'Denetim Uzmanı', 
          'Koordinatör Seviyesi', 'Yönetsel Uzman', 'Danışman Seviyesi', 'Usta Eğitmen', 'Grand Master (Usta-Uzman)'
        ]
      }
    ];

    let levelNumber = 1;

    // Her grup için seviyeleri oluştur
    for (const group of levelGroups) {
      for (const levelName of group.levels) {
        const levelData = {
          name: levelName,
          level: levelNumber,
          description: `${levelName} - ${group.groupName}`,
          minScore: 0,
          maxScore: 100,
          passingScore: 70,
          timeLimit: 30,
          questionCount: 10,
          isActive: true,
          prerequisites: levelNumber === 1 ? [] : [levelNumber - 1],
          rewards: {
            points: levelNumber * 50,
            badge: `${levelName} Rozeti`
          },
          createdBy: admin._id,
          groupName: group.groupName // Grup bilgisi ekliyoruz
        };

        const level = new Level(levelData);
        await level.save();
        console.log(`Seviye ${levelNumber} oluşturuldu: ${levelName} (${group.groupName})`);
        levelNumber++;
      }
    }

    console.log(`\n${levelNumber - 1} seviye başarıyla oluşturuldu!`);

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

updateLevelNames();