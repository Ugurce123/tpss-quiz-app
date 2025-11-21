# 🔧 Giriş Sorunu Çözümü

## Tespit Edilen Sorunlar

### 1. API URL Yapılandırması Hatası
**Sorun**: Client tarafında API URL'leri çift `/api` prefix'i ile oluşturuluyordu.
- Önceki: `https://tpss-quiz-app.vercel.app` + `/api/auth/login` = `https://tpss-quiz-app.vercel.app/api/auth/login`
- Vercel routing: `/api/*` → `/api/index.js` 
- Sonuç: `https://tpss-quiz-app.vercel.app/api/api/auth/login` ❌

**Çözüm**: 
- `client/.env.production` dosyasında `REACT_APP_API_URL` değeri `/api` ile bitmeli
- `client/src/config/api.js` dosyasında endpoint'ler `/api` prefix'i olmadan tanımlanmalı

### 2. CORS Yapılandırması
**Sorun**: `api/index.js` dosyasında CORS `origin: true` olarak ayarlanmıştı (güvenlik riski).

**Çözüm**: Sadece belirli origin'lere izin verecek şekilde yapılandırıldı.

## Yapılan Değişiklikler

### 1. `client/.env.production`
```env
REACT_APP_API_URL=https://tpss-quiz-app.vercel.app/api
```

### 2. `client/src/config/api.js`
```javascript
// Endpoint'ler artık /api prefix'i olmadan
LOGIN: `${API_BASE_URL}/auth/login`,
REGISTER: `${API_BASE_URL}/auth/register`,
// ...
```

### 3. `api/index.js`
```javascript
// Güvenli CORS yapılandırması
const allowedOrigins = [
  'http://localhost:3000',
  'https://tpss-quiz-app.vercel.app',
  // ...
];
```

## Deployment Adımları

### 1. Vercel Environment Variables Kontrolü
Vercel dashboard'da şu environment variables'ların ayarlı olduğundan emin olun:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://sawtpss_db_user2:BBPyeBsCzpzL5wYp@baggage-quiz-cluster.to5bpqn.mongodb.net/tpss-quiz?retryWrites=true&w=majority
JWT_SECRET=tpss-super-secret-jwt-key-2024-production-secure
SESSION_SECRET=tpss-session-secret-2024-production-secure
CORS_ORIGIN=https://tpss-quiz-app.vercel.app
```

### 2. Yeniden Deploy
```bash
# Client'ı build et
cd client
npm run build

# Git'e commit ve push
git add .
git commit -m "Fix: API URL ve CORS yapılandırması düzeltildi"
git push origin main
```

### 3. Vercel'de Otomatik Deploy
- Vercel otomatik olarak yeni commit'i algılayacak ve deploy edecek
- Deploy tamamlandıktan sonra siteyi test edin

## Test Adımları

### 1. Browser Console'da Test
```javascript
// Browser console'da çalıştırın
fetch('https://tpss-quiz-app.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

Beklenen sonuç:
```json
{
  "status": "OK",
  "timestamp": "2024-...",
  "mongodb": "connected"
}
```

### 2. Login Test
1. Siteye gidin: https://tpss-quiz-app.vercel.app
2. Login sayfasına gidin
3. Admin credentials ile giriş yapın:
   - Email: `admin@baggage-quiz.com`
   - Password: `Ugur.Saw-123`

### 3. Network Tab Kontrolü
1. Browser'da F12 ile Developer Tools'u açın
2. Network tab'ına gidin
3. Login butonuna tıklayın
4. `/api/auth/login` isteğini kontrol edin:
   - Status: 200 OK olmalı
   - Response: `{ token: "...", user: {...} }` içermeli

## Olası Sorunlar ve Çözümleri

### Sorun 1: "CORS Error"
**Çözüm**: Vercel'de `CORS_ORIGIN` environment variable'ını kontrol edin.

### Sorun 2: "Network Error" veya "Failed to fetch"
**Çözüm**: 
- API URL'ini kontrol edin
- Vercel'de API fonksiyonunun çalıştığından emin olun
- `/api/health` endpoint'ini test edin

### Sorun 3: "401 Unauthorized"
**Çözüm**: 
- MongoDB bağlantısını kontrol edin
- Admin kullanıcısının database'de olduğundan emin olun
- JWT_SECRET environment variable'ını kontrol edin

### Sorun 4: "500 Internal Server Error"
**Çözüm**: 
- Vercel logs'ları kontrol edin
- MongoDB URI'nin doğru olduğundan emin olun
- Database'de User collection'ının olduğundan emin olun

## Admin Kullanıcı Bilgileri

Eğer admin kullanıcısı yoksa, MongoDB Atlas'ta manuel olarak oluşturun:

```javascript
// MongoDB Compass veya Atlas'ta çalıştırın
db.users.insertOne({
  username: "admin",
  email: "admin@tpss.com",
  password: "$2a$12$...", // bcrypt hash of "Admin123!"
  role: "admin",
  isApproved: true,
  isBlocked: false,
  currentLevel: 1,
  completedLevels: [],
  testHistory: [],
  ipAddresses: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Destek

Sorun devam ederse:
1. Vercel logs'ları kontrol edin
2. Browser console'da hata mesajlarını kontrol edin
3. Network tab'ında API isteklerini inceleyin
