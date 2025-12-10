// Mock Data - Backend olmadan çalışma için

export const mockLevels = Array.from({ length: 50 }, (_, i) => {
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
  
  const levelNames = [
    'Bagaj Tanıma', 'Güvenlik Temelleri', 'X-Ray Okuma', 'Metal Dedektörü', 
    'El Bagajı Kontrolü', 'Büyük Bagaj Kontrolü', 'Sıvı Kuralları', 
    'Elektronik Cihazlar', 'Kişisel Eşyalar', 'Temel Prosedürler',
    'Şüpheli Eşya Tespiti', 'Kimyasal Maddeler', 'Patlayıcı Tanıma', 
    'Kesici Aletler', 'Ateşli Silahlar', 'Kaçak Eşya', 'Gümrük Kuralları',
    'Uluslararası Standartlar', 'Risk Değerlendirmesi', 'Acil Durum Protokolü',
    'Biyolojik Tehditler', 'Radyoaktif Maddeler', 'Narkotik Maddeler',
    'Terör Tehditleri', 'Siber Güvenlik', 'İstihbarat Analizi',
    'Profil Analizi', 'Davranış Analizi', 'Teknoloji Entegrasyonu', 'Veri Analizi',
    'Kriz Yönetimi', 'Takım Liderliği', 'Eğitim Verme', 'Kalite Kontrol',
    'Süreç Optimizasyonu', 'Teknoloji Yönetimi', 'Stratejik Planlama',
    'Uluslararası İşbirliği', 'Araştırma Geliştirme', 'İnovasyon Yönetimi',
    'Sistem Tasarımı', 'Politika Geliştirme', 'Küresel Standartlar',
    'Gelecek Teknolojileri', 'Yapay Zeka Entegrasyonu', 'Otomasyon Sistemleri',
    'Büyük Veri Analizi', 'Makine Öğrenmesi', 'Güvenlik Mimarisi', 'Master Sertifikası'
  ];
  
  return {
    _id: `level-${level}`,
    name: levelNames[i],
    level: level,
    description: `${groupInfo.group} seviye - ${levelNames[i]} konusunda uzmanlaşma`,
    passingScore: groupInfo.passingScore,
    timeLimit: groupInfo.timeLimit,
    questionCount: groupInfo.questionCount,
    rewards: {
      points: groupInfo.points,
      badge: `${levelNames[i]} Uzmanı`
    }
  };
});

export const mockQuestions = [
  {
    _id: 'q1',
    question: 'Havalimanı güvenlik kontrolünde hangi eşyalar yasaktır?',
    type: 'dirty',
    dirtyReasons: ['Patlayıcı madde', 'Kesici alet', 'Yanıcı sıvı'],
    level: 1
  },
  {
    _id: 'q2',
    question: 'Normal kişisel eşyalar (giysi, kitap, kozmetik)',
    type: 'clean',
    level: 1
  },
  {
    _id: 'q3',
    question: 'X-ray cihazında şüpheli bir görüntü gördüğünüzde ne yaparsınız?',
    type: 'dirty',
    dirtyReasons: ['Manuel kontrol gerekli', 'Güvenlik protokolü'],
    level: 1
  }
];

export const mockUsers = {
  admin: {
    username: 'admin@baggage-quiz.com',
    email: 'admin@baggage-quiz.com',
    password: 'Ugur.Saw-123',
    role: 'admin',
    isApproved: true,
    currentLevel: 1,
    completedLevels: [],
    totalScore: 0
  }
};