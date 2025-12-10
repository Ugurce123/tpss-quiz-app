# 📋 Manuel Deployment Kılavuzu

Git yüklü değilse bu adımları takip edin.

## 🚀 Adım Adım Deployment

### 1. MongoDB Atlas Kurulumu (5 dakika)

1. [MongoDB Atlas](https://www.mongodb.com/atlas) → Sign Up
2. "Create a Free Cluster" → AWS → Ücretsiz tier seçin
3. Cluster adı: `baggage-quiz`
4. "Database Access" → Add New User:
   - Username: `baggagequiz`
   - Password: Güçlü şifre oluşturun
5. "Network Access" → Add IP Address → `0.0.0.0/0` (Allow from anywhere)
6. "Connect" → "Connect your application" → Connection string kopyalayın

### 2. Vercel Frontend Deployment (3 dakika)

1. [Vercel](https://vercel.com) → Sign Up with GitHub
2. "New Project" → "Import Git Repository"
3. GitHub'da yeni repository oluşturun:
   - Repository name: `baggage-quiz-app`
   - Public seçin
   - Tüm dosyaları upload edin
4. Vercel'de repository'yi seçin
5. Framework: "Create React App"
6. Root Directory: `client`
7. Environment Variables ekleyin:
   ```
   REACT_APP_API_URL = https://your-backend-url.vercel.app
   REACT_APP_ENV = production
   GENERATE_SOURCEMAP = false
   ```
8. "Deploy" butonuna tıklayın

### 3. Vercel Backend Deployment (3 dakika)

1. Vercel'de yeni proje oluşturun
2. Aynı repository'yi seçin
3. Root Directory: `server`
4. Environment Variables ekleyin:
   ```
   MONGODB_URI = mongodb+srv://baggagequiz:password@cluster.mongodb.net/baggage-quiz
   JWT_SECRET = BaggageQuizProd2024!VerySecureKey#Random$Complex&Token@Security
   NODE_ENV = production
   PORT = 5001
   ALLOWED_ORIGINS = https://your-frontend-url.vercel.app
   ```
5. "Deploy" butonuna tıklayın

### 4. URL'leri Güncelleyin

1. Backend URL'ini kopyalayın (örn: `https://baggage-quiz-backend.vercel.app`)
2. Frontend projesinin environment variables'ını güncelleyin:
   ```
   REACT_APP_API_URL = https://baggage-quiz-backend.vercel.app
   ```
3. Backend projesinin environment variables'ını güncelleyin:
   ```
   ALLOWED_ORIGINS = https://baggage-quiz-frontend.vercel.app
   ```
4. Her iki projeyi de redeploy edin

### 5. Database Setup

1. MongoDB Atlas'ta "Browse Collections" → "Add My Own Data"
2. Database name: `baggage-quiz`
3. Collection name: `users`
4. Vercel backend URL'ine gidin: `https://your-backend.vercel.app/health`
5. Çalıştığını kontrol edin

### 6. Admin Hesabı Oluşturma

Backend'de serverless function olarak admin oluşturucu ekleyelim:

```javascript
// /api/setup-admin endpoint'i ile admin oluşturun
```

## 🎯 Alternatif: Netlify + Railway

### Frontend (Netlify)
1. [Netlify](https://netlify.com) → GitHub bağlayın
2. Build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`

### Backend (Railway)
1. [Railway](https://railway.app) → GitHub bağlayın
2. Environment variables ekleyin
3. Deploy

## 🔧 Troubleshooting

### Yaygın Sorunlar

1. **CORS Error**
   - Backend'de `ALLOWED_ORIGINS` environment variable'ını kontrol edin
   - Frontend URL'ini tam olarak ekleyin

2. **Database Connection Error**
   - MongoDB Atlas IP whitelist'ini kontrol edin
   - Connection string'in doğru olduğundan emin olun

3. **Build Error**
   - Node.js versiyonunu kontrol edin (>=18)
   - Package.json'daki dependencies'leri kontrol edin

4. **API 404 Error**
   - Backend URL'inin doğru olduğundan emin olun
   - Environment variables'ları kontrol edin

### Log Kontrolü

- **Vercel**: Dashboard → Functions → View Logs
- **Netlify**: Dashboard → Site → Functions
- **Railway**: Dashboard → Deployments → Logs

## 📞 Yardım

Sorun yaşarsanız:
1. Browser console'u kontrol edin (F12)
2. Network tab'inde API çağrılarını kontrol edin
3. Backend logs'ları kontrol edin
4. Environment variables'ları doğrulayın

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Database user oluşturuldu
- [ ] GitHub repository oluşturuldu
- [ ] Vercel frontend deploy edildi
- [ ] Vercel backend deploy edildi
- [ ] Environment variables ayarlandı
- [ ] CORS ayarları güncellendi
- [ ] Admin hesabı oluşturuldu
- [ ] Test edildi

Deployment tamamlandığında:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.vercel.app`
- Admin: `admin@baggage-quiz.com / admin123`