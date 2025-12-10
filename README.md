# 🧳 Baggage Security Quiz Application

Modern, güvenli ve kullanıcı dostu bagaj güvenlik eğitim platformu.

## 🌟 Özellikler

- **🔐 Güvenli Kimlik Doğrulama**: JWT tabanlı güvenli giriş sistemi
- **📊 50 Seviye Sistemi**: Aşamalı öğrenme deneyimi
- **⏱️ Gerçek Zamanlı Timer**: Her soru için 25 saniyelik süre
- **📈 İstatistikler**: Detaylı performans analizi ve liderlik tablosu
- **👨‍💼 Admin Paneli**: Soru ve kullanıcı yönetimi
- **📱 Mobil Uyumlu**: Responsive tasarım
- **🛡️ Güvenlik**: Çok katmanlı güvenlik önlemleri

## 🚀 Canlı Demo

- **Frontend**: [https://baggage-quiz.vercel.app](https://baggage-quiz.vercel.app)
- **Admin Panel**: Admin hesabı ile giriş yapın

## 🛠️ Teknolojiler

### Frontend
- React 18
- React Router DOM
- Framer Motion (Animasyonlar)
- Tailwind CSS
- Axios

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Helmet (Güvenlik)
- Rate Limiting
- Input Validation

### Güvenlik
- XSS Koruması
- SQL Injection Koruması
- Rate Limiting
- CORS Güvenliği
- Helmet Security Headers
- Input Sanitization

## 📦 Kurulum

### Gereksinimler
- Node.js >= 18.0.0
- MongoDB
- npm >= 8.0.0

### Yerel Kurulum

1. **Repository'yi klonlayın**
   ```bash
   git clone https://github.com/yourusername/baggage-quiz-app.git
   cd baggage-quiz-app
   ```

2. **Tüm bağımlılıkları yükleyin**
   ```bash
   npm run install:all
   ```

3. **Environment variables ayarlayın**
   
   `server/.env` dosyası oluşturun:
   ```env
   MONGODB_URI=mongodb://localhost:27017/baggage-quiz
   JWT_SECRET=your-super-secret-key
   PORT=5001
   NODE_ENV=development
   ```

   `client/.env.development` dosyası oluşturun:
   ```env
   REACT_APP_API_URL=http://localhost:5001
   ```

4. **MongoDB'yi başlatın**
   ```bash
   mongod
   ```

5. **Uygulamayı başlatın**
   ```bash
   npm run dev
   ```

6. **Tarayıcıda açın**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

## 👨‍💼 Admin Hesabı Oluşturma

```bash
cd server
node create-admin.js
```

## 📊 Veritabanı Kurulumu

```bash
cd server
node create-levels.js    # Seviyeleri oluştur
node create-questions.js # Soruları oluştur (eğer varsa)
```

## 🚀 Production Deployment

### Vercel (Önerilen)

1. **MongoDB Atlas kurulumu**
   - [MongoDB Atlas](https://www.mongodb.com/atlas) hesabı oluşturun
   - Ücretsiz cluster oluşturun
   - Connection string'i alın

2. **Vercel'e deploy**
   - [Vercel](https://vercel.com) hesabı oluşturun
   - GitHub repository'nizi bağlayın
   - Environment variables ekleyin
   - Deploy!

Detaylı deployment kılavuzu için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasına bakın.

## 🎮 Kullanım

### Kullanıcı Akışı
1. Kayıt ol / Giriş yap
2. Admin onayını bekle
3. Seviye 1'den başla
4. Her seviyeyi geçerek ilerle
5. İstatistiklerini takip et

### Admin Akışı
1. Admin hesabı ile giriş yap
2. Kullanıcıları onayla
3. Soru ekle/düzenle
4. Seviye yönet
5. İstatistikleri görüntüle

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Quiz
- `GET /api/quiz/start/:levelId` - Test başlat
- `POST /api/quiz/submit` - Test gönder
- `GET /api/quiz/stats` - Kullanıcı istatistikleri

### Levels
- `GET /api/levels` - Seviyeleri listele
- `POST /api/levels` - Seviye oluştur (Admin)

### Statistics
- `GET /api/statistics/general` - Genel istatistikler
- `GET /api/statistics/leaderboard` - Liderlik tablosu

## 🛡️ Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rate limiting (DDoS koruması)
- Input validation ve sanitization
- XSS ve CSRF koruması
- Helmet security headers
- MongoDB injection koruması
- Brute force koruması

## 📱 Mobil Uyumluluk

- Responsive tasarım
- Touch-friendly interface
- Mobile-first yaklaşım
- PWA desteği (gelecekte)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Email**: support@baggagequiz.com
- **GitHub**: [https://github.com/yourusername/baggage-quiz-app](https://github.com/yourusername/baggage-quiz-app)

## 🙏 Teşekkürler

- React ekibine harika framework için
- MongoDB ekibine güçlü veritabanı için
- Vercel ekibine ücretsiz hosting için

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!