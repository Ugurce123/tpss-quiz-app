# 🔧 MongoDB Atlas Kurulum ve Admin Kullanıcı Oluşturma

## ❌ Tespit Edilen Sorun

**MongoDB'de admin kullanıcısı yok!**
- Database'de hiç admin kullanıcısı bulunmuyor
- Bu yüzden giriş yapılamıyor

## 🔐 MongoDB Atlas Authentication Hatası

Mevcut `.env.production.local` dosyasındaki MongoDB credentials çalışmıyor:
```
MONGODB_URI=mongodb+srv://sawtpss_db_user2:BBPyeBsCzpzL5wYp@baggage-quiz-cluster.to5bpqn.mongodb.net/tpss-quiz?retryWrites=true&w=majority
```

**Hata**: `bad auth : Authentication failed`

## ✅ Çözüm Adımları

### Seçenek 1: MongoDB Atlas'ta Yeni Database User Oluştur (ÖNERİLEN)

1. **MongoDB Atlas'a giriş yapın**
   - https://cloud.mongodb.com/

2. **Database Access'e gidin**
   - Sol menüden "Database Access" seçin

3. **Yeni Database User oluşturun**
   - "Add New Database User" butonuna tıklayın
   - Authentication Method: Password
   - Username: `tpss_admin` (veya istediğiniz bir isim)
   - Password: Güçlü bir şifre oluşturun (örn: `TpssAdmin2024!`)
   - Database User Privileges: "Atlas admin" veya "Read and write to any database"
   - "Add User" butonuna tıklayın

4. **Network Access'i kontrol edin**
   - Sol menüden "Network Access" seçin
   - IP Whitelist'e `0.0.0.0/0` ekleyin (tüm IP'lere izin verir)
   - Veya Vercel'in IP aralıklarını ekleyin

5. **Connection String'i alın**
   - "Database" sekmesine gidin
   - "Connect" butonuna tıklayın
   - "Connect your application" seçin
   - Connection string'i kopyalayın
   - Şu formatta olacak:
     ```
     mongodb+srv://<username>:<password>@baggage-quiz-cluster.to5bpqn.mongodb.net/tpss-quiz?retryWrites=true&w=majority
     ```
   - `<username>` ve `<password>` kısımlarını yeni oluşturduğunuz kullanıcı bilgileriyle değiştirin

### Seçenek 2: Mevcut User'ın Şifresini Sıfırla

1. MongoDB Atlas'a giriş yapın
2. "Database Access" sekmesine gidin
3. `sawtpss_db_user2` kullanıcısını bulun
4. "Edit" butonuna tıklayın
5. "Edit Password" seçeneğini kullanarak yeni şifre belirleyin
6. Yeni şifreyi `.env.production.local` dosyasına güncelleyin

## 📝 Environment Variables Güncelleme

### 1. Local Environment (.env.production.local)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://YENI_USERNAME:YENI_PASSWORD@baggage-quiz-cluster.to5bpqn.mongodb.net/tpss-quiz?retryWrites=true&w=majority
JWT_SECRET=tpss-super-secret-jwt-key-2024-production-secure
SESSION_SECRET=tpss-session-secret-2024-production-secure
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12
```

### 2. Vercel Environment Variables
Vercel Dashboard → Settings → Environment Variables:
```
MONGODB_URI=mongodb+srv://YENI_USERNAME:YENI_PASSWORD@baggage-quiz-cluster.to5bpqn.mongodb.net/tpss-quiz?retryWrites=true&w=majority
JWT_SECRET=tpss-super-secret-jwt-key-2024-production-secure
SESSION_SECRET=tpss-session-secret-2024-production-secure
NODE_ENV=production
CORS_ORIGIN=https://tpss-quiz-app.vercel.app
```

## 🚀 Admin Kullanıcı Oluşturma

MongoDB credentials düzeltildikten sonra:

```bash
# Server klasörüne gidin
cd server

# Admin kullanıcısını oluşturun
node create-production-admin.js
```

Beklenen çıktı:
```
✅ MongoDB bağlantısı başarılı
📝 Yeni admin kullanıcısı oluşturuluyor...
✅ Admin kullanıcısı oluşturuldu!

📊 Admin Kullanıcı Bilgileri:
   Username: admin
   Email: admin@baggage-quiz.com
   Role: admin
   Approved: true

🔐 Şifre testi yapılıyor...
   Şifre doğrulaması: ✅ BAŞARILI

🎉 Admin kullanıcısı hazır! Artık giriş yapabilirsiniz:
   Email: admin@baggage-quiz.com
   Password: Ugur.Saw-123
```

## 🧪 Test Adımları

### 1. MongoDB Bağlantı Testi
```bash
cd server
node check-admin-user.js
```

### 2. Login Testi
1. https://tpss-quiz-app.vercel.app adresine gidin
2. Login sayfasına gidin
3. Giriş yapın:
   ```
   Email: admin@baggage-quiz.com
   Password: Ugur.Saw-123
   ```

### 3. API Test
Browser console'da:
```javascript
fetch('https://tpss-quiz-app.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@baggage-quiz.com',
    password: 'Ugur.Saw-123'
  })
})
.then(r => r.json())
.then(console.log)
```

## 🔍 Sorun Giderme

### Hata: "bad auth : Authentication failed"
**Çözüm**: 
- MongoDB Atlas'ta database user credentials'ını kontrol edin
- Şifrede özel karakterler varsa URL encode edin
- Network Access'te IP whitelist'i kontrol edin

### Hata: "MongoServerError: user is not allowed to do action"
**Çözüm**: 
- Database user'ın yeterli yetkisi olduğundan emin olun
- "Read and write to any database" yetkisi verin

### Hata: "querySrv ENOTFOUND"
**Çözüm**: 
- MongoDB cluster hostname'ini kontrol edin
- Internet bağlantınızı kontrol edin

## 📞 Yardım

MongoDB Atlas kurulumu için:
- https://www.mongodb.com/docs/atlas/getting-started/

Vercel Environment Variables için:
- https://vercel.com/docs/projects/environment-variables

---

**Sonraki Adım**: MongoDB credentials'ı düzelttikten sonra `create-production-admin.js` scriptini çalıştırın.
