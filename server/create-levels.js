const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Level');
const User = require('./models/User');

async function createLevels() {
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

    // Mevcut seviyeleri kontrol et
    const existingLevels = await Level.find({});
    if (existingLevels.length > 0) {
      console.log('Seviyeler zaten mevcut:', existingLevels.length);
      return;
    }

    // 50 Seviyeli Sistem - 5 Ana Grup
    const levels = [];

    // Grup 1: Temel Seviyeler (1-10)
    const basicLevels = [
      'Bagaj Tanıma', 'Güvenlik Temelleri', 'X-Ray Okuma', 'Metal Dedektörü',
      'El Bagajı Kontrolü', 'Büyük Bagaj Kontrolü', 'Sıvı Kuralları',
      'Elektronik Cihazlar', 'Kişisel Eşyalar', 'Temel Prosedürler'
    ];

    // Grup 2: Orta Seviyeler (11-20)
    const intermediateLevels = [
      'Şüpheli Eşya Tespiti', 'Kimyasal Maddeler', 'Patlayıcı Tanıma',
      'Kesici Aletler', 'Ateşli Silahlar', 'Kaçak Eşya', 'Gümrük Kuralları',
      'Uluslararası Standartlar', 'Risk Değerlendirmesi', 'Acil Durum Protokolü'
    ];

    // Grup 3: İleri Seviyeler (21-30)
    const advancedLevels = [
      'Biyolojik Tehditler', 'Radyoaktif Maddeler', 'Narkotik Maddeler',
      'Terör Tehditleri', 'Siber Güvenlik', 'İstihbarat Analizi',
      'Profil Analizi', 'Davranış Analizi', 'Teknoloji Entegrasyonu', 'Veri Analizi'
    ];

    // Grup 4: Uzman Seviyeler (31-40)
    const expertLevels = [
      'Kriz Yönetimi', 'Takım Liderliği', 'Eğitim Verme', 'Kalite Kontrol',
      'Süreç Optimizasyonu', 'Teknoloji Yönetimi', 'Stratejik Planlama',
      'Uluslararası İşbirliği', 'Araştırma Geliştirme', 'İnovasyon Yönetimi'
    ];

    // Grup 5: Master Seviyeler (41-50)
    const masterLevels = [
      'Sistem Tasarımı', 'Politika Geliştirme', 'Küresel Standartlar',
      'Gelecek Teknolojileri', 'Yapay Zeka Entegrasyonu', 'Otomasyon Sistemleri',
      'Büyük Veri Analizi', 'Makine Öğrenmesi', 'Güvenlik Mimarisi', 'Master Sertifikası'
    ];

    const allLevelNames = [
      ...basicLevels, ...intermediateLevels, ...advancedLevels,
      ...expertLevels, ...masterLevels
    ];

    // Seviyeleri oluştur
    for (let i = 0; i < 50; i++) {
      const level = i + 1;
      let groupInfo = {};

      if (level <= 10) {
        groupInfo = {
          group: 'Temel',
          passingScore: 60,
          timeLimit: 15,
          questionCount: 5,
          points: 100 + (level * 10)
        };
      } else if (level <= 20) {
        groupInfo = {
          group: 'Orta',
          passingScore: 65,
          timeLimit: 20,
          questionCount: 7,
          points: 200 + (level * 15)
        };
      } else if (level <= 30) {
        groupInfo = {
          group: 'İleri',
          passingScore: 70,
          timeLimit: 25,
          questionCount: 8,
          points: 300 + (level * 20)
        };
      } else if (level <= 40) {
        groupInfo = {
          group: 'Uzman',
          passingScore: 75,
          timeLimit: 30,
          questionCount: 10,
          points: 500 + (level * 25)
        };
      } else {
        groupInfo = {
          group: 'Master',
          passingScore: 80,
          timeLimit: 35,
          questionCount: 12,
          points: 800 + (level * 30)
        };
      }

      levels.push({
        name: allLevelNames[i],
        level: level,
        description: `${groupInfo.group} seviye - ${allLevelNames[i]} konusunda uzmanlaşma`,
        minScore: 0,
        maxScore: 100,
        passingScore: groupInfo.passingScore,
        timeLimit: groupInfo.timeLimit,
        questionCount: groupInfo.questionCount,
        prerequisites: level === 1 ? [] : [level - 1],
        rewards: {
          points: groupInfo.points,
          badge: `${allLevelNames[i]} Uzmanı`
        },
        createdBy: admin._id
      });
    }

    // Seviyeleri oluştur
    for (const levelData of levels) {
      const level = new Level(levelData);
      await level.save();
      console.log(`Seviye oluşturuldu: ${level.name} (Seviye ${level.level})`);
    }

    console.log('Tüm seviyeler başarıyla oluşturuldu!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

createLevels();