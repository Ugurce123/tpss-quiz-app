# 🔧 Vercel Environment Variables - Detaylı Rehber

## 📋 ADIM ADIM ENVIRONMENT VARIABLES EKLEME

---

## 1️⃣ Environment Variables Bölümünü Bul

### Vercel'de Project Ayarları Ekranındasınız:

```
┌─────────────────────────────────────────┐
│ Configure Project                       │
├─────────────────────────────────────────┤
│ Project Name: baggage-quiz-app          │
│ Framework Preset: Other                 │
│ Root Directory: /                       │
│ Build Command: (auto)                   │
│ Output Directory: (auto)                │
│                                         │
│ ▼ Environment Variables                 │  ← BURAYA TIKLA
│                                         │
└─────────────────────────────────────────┘
```

**"Environment Variables" başlığına tıklayın** (▼ işareti)

---

## 2️⃣ İlk Değişkeni Ekle

### Açılan Bölümde:

```
┌─────────────────────────────────────────┐
│ Environment Variables                   │
├─────────────────────────────────────────┤
│ Key:   [________________]               │
│ Value: [________________]               │
│                                         │
│ [Add] butonu                            │
└─────────────────────────────────────────┘
```

---

## 3️⃣ Değişkenleri TEK TEK Ekle

### ✅ DEĞİŞKEN 1: NODE_ENV

**Key alanına yaz:**
```
NODE_ENV
```

**Value alanına yaz:**
```
production
```

**"Add" butonuna tıkla**

---

### ✅ DEĞİŞKEN 2: MONGODB_URI

**Key alanına yaz:**
```
MONGODB_URI
```

**Value alanına yaz:**
```
mongodb+srv://baggage-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/baggage-quiz?retryWrites=true&w=majority
```

**⚠️ ÖNEMLİ:**
- `YOUR_PASSWORD` kısmını MongoDB Atlas şifrenizle değiştirin
- `cluster0.xxxxx` kısmı sizin cluster adınız olacak
- `/baggage-quiz` database adı

**"Add" butonuna tıkla**

---

### ✅ DEĞİŞKEN 3: JWT_SECRET

**Key alanına yaz:**
```
JWT_SECRET
```

**Value alanına yaz:**
```
baggage-quiz-super-secret-jwt-key-2024-production-xyz789
```

**"Add" butonuna tıkla**

---

### ✅ DEĞİŞKEN 4: CORS_ORIGIN

**Key alanına yaz:**
```
CORS_ORIGIN
```

**Value alanına yaz:**
```
https://baggage-quiz-app.vercel.app
```

**⚠️ NOT:** Deploy sonrası gerçek domain ile güncelleyeceğiz

**"Add" butonuna tıkla**

---

### ✅ DEĞİŞKEN 5: RATE_LIMIT_WINDOW_MS

**Key alanına yaz:**
```
RATE_LIMIT_WINDOW_MS
```

**Value alanına yaz:**
```
900000
```

**"Add" butonuna tıkla**

---

### ✅ DEĞİŞKEN 6: RATE_LIMIT_MAX_REQUESTS

**Key alanına yaz:**
```
RATE_LIMIT_MAX_REQUESTS
```

**Value alanına yaz:**
```
100
```

**"Add" butonuna tıkla**

---

### ✅ DEĞİŞKEN 7: BCRYPT_ROUNDS

**Key alanına yaz:**
```
BCRYPT_ROUNDS
```

**Value alanına yaz:**
```
12
```

**"Add" butonuna tıkla**

---

### ✅ DEĞİŞKEN 8: SESSION_SECRET

**Key alanına yaz:**
```
SESSION_SECRET
```

**Value alanına yaz:**
```
baggage-quiz-session-secret-2024-abc456
```

**"Add" butonuna tıkla**

---

### ✅ DEĞİŞKEN 9: REACT_APP_API_URL

**Key alanına yaz:**
```
REACT_APP_API_URL
```

**Value alanına yaz:**
```
https://baggage-quiz-app.vercel.app
```

**⚠️ NOT:** Deploy sonrası gerçek domain ile güncelleyeceğiz

**"Add" butonuna tıkla**

---

## 4️⃣ Kontrol Et

### Tüm değişkenler eklendikten sonra göreceksiniz:

```
┌─────────────────────────────────────────┐
│ Environment Variables (9)               │
├─────────────────────────────────────────┤
│ ✓ NODE_ENV                              │
│ ✓ MONGODB_URI                           │
│ ✓ JWT_SECRET                            │
│ ✓ CORS_ORIGIN                           │
│ ✓ RATE_LIMIT_WINDOW_MS                  │
│ ✓ RATE_LIMIT_MAX_REQUESTS               │
│ ✓ BCRYPT_ROUNDS                         │
│ ✓ SESSION_SECRET                        │
│ ✓ REACT_APP_API_URL                     │
└─────────────────────────────────────────┘
```

**9 değişken olmalı!**

---

## 5️⃣ Deploy Et

### Tüm değişkenler eklendikten sonra:

1. **Sayfayı aşağı kaydır**
2. **"Deploy" butonunu bul**
3. **"Deploy" butonuna tıkla**
4. ⏳ **Build sürecini izle** (1-2 dakika)

---

## 📝 ÖZET - KOPYALA YAPIŞTIR İÇİN

Hızlı referans için:

```
Key: NODE_ENV
Value: production

Key: MONGODB_URI
Value: mongodb+srv://baggage-admin:YOUR_PASSWORD@cluster.mongodb.net/baggage-quiz?retryWrites=true&w=majority

Key: JWT_SECRET
Value: baggage-quiz-super-secret-jwt-key-2024-production-xyz789

Key: CORS_ORIGIN
Value: https://baggage-quiz-app.vercel.app

Key: RATE_LIMIT_WINDOW_MS
Value: 900000

Key: RATE_LIMIT_MAX_REQUESTS
Value: 100

Key: BCRYPT_ROUNDS
Value: 12

Key: SESSION_SECRET
Value: baggage-quiz-session-secret-2024-abc456

Key: REACT_APP_API_URL
Value: https://baggage-quiz-app.vercel.app
```

---

## ⚠️ ÖNEMLİ NOTLAR

### MONGODB_URI:
- MongoDB Atlas'tan aldığınız connection string
- `<password>` kısmını gerçek şifrenizle değiştirin
- `/baggage-quiz` database adını ekleyin

### CORS_ORIGIN ve REACT_APP_API_URL:
- İlk deploy için geçici domain
- Deploy tamamlandıktan sonra gerçek domain ile güncelleyin

---

## 🎯 SONRAKI ADIM

Environment variables eklendikten sonra:
1. ✅ "Deploy" butonuna tıkla
2. ⏳ Build sürecini izle
3. ✅ Domain al
4. 🔄 CORS_ORIGIN ve REACT_APP_API_URL güncelle
5. 🔄 Redeploy yap

---

**Environment variables eklemeye başlayabilirsiniz!** 🚀