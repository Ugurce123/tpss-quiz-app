const mongoose = require('mongoose');
require('dotenv').config();

const Level = require('./models/Level');
const Question = require('./models/Question');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function initProductionDatabase() {
  try {
    console.log('🔗 MongoDB Atlas bağlantısı kuruluyor...');
    
    // Production MongoDB URI kullan
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable bulunamadı!');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Atlas bağlantısı başarılı');

    // Mevcut verileri kontrol et
    const existingLevels = await Level.countDocuments();
    const existingQuestions = await Question.countDocuments();
    const existingUsers = await User.countDocuments();
    
    console.log(`📊 Mevcut veriler: ${existingLevels} seviye, ${existingQuestions} soru, ${existingUsers} kullanıcı`);

    // Eğer veriler yoksa oluştur
    if (existingLevels === 0) {
      console.log('📝 50 seviye oluşturuluyor...');
      await createLevels();
    }

    if (existingQuestions === 0) {
      console.log('❓ Örnek sorular oluşturuluyor...');
      await createSampleQuestions();
    }

    if (existingUsers === 0) {
      console.log('👤 Admin kullanıcısı oluşturuluyor...');
      await createAdminUser();
    }

    console.log('🎉 Production database başarıyla hazırlandı!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

async function createLevels() {
  // 50 Seviyeli Sistem
  const levels = [];
  
  const basicLevels = [
    'Bagaj Tanıma', 'Güvenlik Temelleri', 'X-Ray Okuma', 'Metal Dedektörü', 
    'El Bagajı Kontrolü', 'Büyük Bagaj Kontrolü', 'Sıvı Kuralları', 
    'Elektronik Cihazlar', 'Kişisel Eşyalar', 'Temel Prosedürler'
  ];
  
  const intermediateLevels = [
    'Şüpheli Eşya Tespiti', 'Kimyasal Maddeler', 'Patlayıcı Tanıma', 
    'Kesici Aletler', 'Ateşli Silahlar', 'Kaçak Eşya', 'Gümrük Kuralları',
    'Uluslararası Standartlar', 'Risk Değerlendirmesi', 'Acil Durum Protokolü'
  ];
  
  const advancedLevels = [
    'Biyolojik Tehditler', 'Radyoaktif Maddeler', 'Narkotik Maddeler',
    'Terör Tehditleri', 'Siber Güvenlik', 'İstihbarat Analizi',
    'Profil Analizi', 'Davranış Analizi', 'Teknoloji Entegrasyonu', 'Veri Analizi'
  ];
  
  const expertLevels = [
    'Kriz Yönetimi', 'Takım Liderliği', 'Eğitim Verme', 'Kalite Kontrol',
    'Süreç Optimizasyonu', 'Teknoloji Yönetimi', 'Stratejik Planlama',
    'Uluslararası İşbirliği', 'Araştırma Geliştirme', 'İnovasyon Yönetimi'
  ];
  
  const masterLevels = [
    'Sistem Tasarımı', 'Politika Geliştirme', 'Küresel Standartlar',
    'Gelecek Teknolojileri', 'Yapay Zeka Entegrasyonu', 'Otomasyon Sistemleri',
    'Büyük Veri Analizi', 'Makine Öğrenmesi', 'Güvenlik Mimarisi', 'Master Sertifikası'
  ];
  
  const allLevelNames = [
    ...basicLevels, ...intermediateLevels, ...advancedLevels, 
    ...expertLevels, ...masterLevels
  ];
  
  // Admin kullanıcısı oluştur (geçici)
  const tempAdmin = new User({
    username: 'temp-admin',
    email: 'temp@admin.com',
    password: await bcrypt.hash('temp123', 12),
    role: 'admin',
    isApproved: true
  });
  await tempAdmin.save();
  
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
    
    const levelData = new Level({
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
      createdBy: tempAdmin._id
    });
    
    await levelData.save();
  }
  
  console.log('✅ 50 seviye oluşturuldu');
}

async function createSampleQuestions() {
  const admin = await User.findOne({ role: 'admin' });
  
  const sampleQuestions = [
    {
      question: "Havalimanı güvenlik kontrolünde hangi eşyalar yasaktır?",
      type: "dirty",
      dirtyReasons: ["Patlayıcı madde", "Kesici alet", "Yanıcı sıvı"],
      level: 1,
      createdBy: admin._id
    },
    {
      question: "X-ray cihazında şüpheli bir görüntü gördüğünüzde ne yaparsınız?",
      type: "dirty", 
      dirtyReasons: ["Manuel kontrol gerekli", "Güvenlik protokolü", "Uzman incelemesi"],
      level: 1,
      createdBy: admin._id
    },
    {
      question: "Normal kişisel eşyalar (giysi, kitap, kozmetik)",
      type: "clean",
      level: 1,
      createdBy: admin._id
    }
  ];

  for (const questionData of sampleQuestions) {
    const question = new Question(questionData);
    await question.save();
  }
  
  console.log('✅ Örnek sorular oluşturuldu');
}

async function createAdminUser() {
  // NOT: User model'inde pre-save middleware var, şifreyi otomatik hashliyor
  // Bu yüzden plain text olarak gönderiyoruz
  
  const admin = new User({
    username: 'admin@baggage-quiz.com',
    email: 'admin@baggage-quiz.com',
    password: 'Ugur.Saw-123', // Model'deki middleware hashleyecek
    role: 'admin',
    isApproved: true,
    currentLevel: 1,
    completedLevels: []
  });
  
  await admin.save();
  console.log('✅ Admin kullanıcısı oluşturuldu (username: admin@baggage-quiz.com, password: Ugur.Saw-123)');
}

// Eğer doğrudan çalıştırılıyorsa
if (require.main === module) {
  initProductionDatabase()
    .then(() => {
      console.log('🎉 Database initialization tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization hatası:', error);
      process.exit(1);
    });
}

module.exports = { initProductionDatabase };