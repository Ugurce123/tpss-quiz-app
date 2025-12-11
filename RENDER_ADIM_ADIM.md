# 🚀 Render.com Adım Adım Deployment

## 1. Render.com'a Giriş
- https://render.com adresine git
- "Get Started for Free" tıkla
- "Continue with GitHub" seç
- GitHub hesabınla giriş yap

## 2. New Web Service Oluştur
- Dashboard'da "New +" butonuna tıkla
- "Web Service" seç
- "Build and deploy from a Git repository" seç
- "Next" tıkla

## 3. Repository Seç
- GitHub'dan repository'ni bul: `tpss-quiz-app`
- "Connect" butonuna tıkla

## 4. Service Configuration
Bu ekranda şu alanları doldur:

### Name (İsim)
```
tpss-quiz-api
```

### Region (Bölge)
```
Frankfurt (EU Central) 
```
(veya en yakın bölgeyi seç)

### Branch
```
master
```

### Root Directory
```
server
```
(ÖNEMLİ: Bu çok önemli, server klasörünü root olarak ayarla)

### Runtime
```
Node
```

### Build Command
```
npm install
```

### Start Command
```
npm start
```

## 5. Plan Seç
- "Free" planı seç (başlangıç için yeterli)

## 6. Environment Variables
"Advanced" sekmesine git ve şu değişkenleri ekle:

### MONGODB_URI
```
mongodb+srv://ugur%20çelik:Saw-Tpss.01@baggage-quiz-cluster.to5bpqn.mongodb.net/baggage-quiz?retryWrites=true&w=majority
```

### JWT_SECRET
```
24a8e73ae959f18afe45aae67afc9ba80b7d15276003c4ceb13ba43315ac3d6a725c6639f6a2dcea158198af63859c27fba6f30fe77255e2ecc2f2e798a1e4d1
```

### NODE_ENV
```
production
```

### PORT
```
10000
```

## 7. Deploy Et
- "Create Web Service" butonuna tıkla
- Deployment başlayacak (5-10 dakika sürer)

## 8. URL'yi Not Et
Deployment tamamlandığında şuna benzer bir URL alacaksın:
```
https://tpss-quiz-api.onrender.com
```

## 🔧 Sorun Giderme

### Root Directory Bulamıyorsan:
- "Advanced" sekmesine bak
- "Root Directory" alanını `server` yap

### Build Command Bulamıyorsan:
- Service oluşturduktan sonra
- Settings > Build & Deploy sekmesine git
- Orada değiştirebilirsin

### Environment Variables Ekleyemiyorsan:
- Service oluşturduktan sonra
- Settings > Environment sekmesine git
- "Add Environment Variable" ile tek tek ekle

## ✅ Başarı Kontrolü
Deployment tamamlandığında:
```
https://YOUR-SERVICE-NAME.onrender.com/health
```
adresine git, şöyle bir response almalısın:
```json
{
  "status": "OK",
  "timestamp": "2025-12-11T...",
  "mongodb": "connected"
}
```