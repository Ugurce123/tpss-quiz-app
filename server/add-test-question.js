const mongoose = require('mongoose');
const Question = require('./models/Question');
const User = require('./models/User');
require('dotenv').config();

async function addTestQuestion() {
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

    // Test sorusu oluştur
    const testQuestion = new Question({
      text: 'Bu bagajda güvenlik açısından sorunlu bir eşya var mı?',
      correctAnswer: 'dirty',
      level: 1,
      points: 10,
      explanation: 'Bu bagajda kesici alet bulunmaktadır.',
      difficulty: 'easy',
      category: 'security',
      image: 'https://drive.google.com/uc?export=view&id=1TBI_I9KB57QnB1Fsyg9TvHtyvcjUJUMZ',
      dirtyReason: 'sharp_objects',
      dirtyOptions: [
        { value: 'sharp_objects', label: 'Kesici/Delici Alet' },
        { value: 'weapon_parts', label: 'Silah / Silah Parçası / Mermi / Fişek' },
        { value: 'explosive_device', label: 'Patlayıcı Madde Düzeneği (Bomba)' }
      ],
      createdBy: admin._id,
      isActive: true
    });

    await testQuestion.save();
    console.log('Test sorusu başarıyla oluşturuldu!');
    console.log('Soru ID:', testQuestion._id);
    console.log('Görsel URL:', testQuestion.image);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

addTestQuestion();