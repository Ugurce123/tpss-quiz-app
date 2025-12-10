# 🔧 vercel.json Düzeltildi - GitHub'a Yükle

## ✅ Sorun Çözüldü

`vercel.json` dosyası düzeltildi. Şimdi GitHub'a yükleyin.

---

## 📋 GITHUB'A YÜKLEME

### GitHub Desktop Kullanıyorsanız:

1. **GitHub Desktop'ı Aç**
2. **Changes sekmesinde** `vercel.json` görünecek
3. **Commit message:** `Fix vercel.json configuration`
4. **"Commit to main"** tıkla
5. **"Push origin"** tıkla

### Web Interface Kullanıyorsanız:

1. **GitHub Repository'ye Git**
   - https://github.com/YOUR_USERNAME/baggage-quiz-app

2. **vercel.json Dosyasını Bul**
   - Ana dizinde `vercel.json` tıkla

3. **Edit (Kalem İkonu)**
   - Sağ üstte kalem ikonuna tıkla

4. **İçeriği Değiştir**
   - Tüm içeriği sil
   - Yeni içeriği yapıştır (aşağıda)

5. **Commit**
   - Commit message: `Fix vercel.json configuration`
   - "Commit changes" tıkla

---

## 📝 YENİ vercel.json İÇERİĞİ

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 30
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

---

## 🎯 SONRAKI ADIM

GitHub'a yükledikten sonra:
1. ✅ Vercel otomatik redeploy yapacak
2. ✅ Veya manuel redeploy yapın
3. ✅ Build başarılı olacak

---

**GitHub'a yükleyin ve Vercel'de tekrar deneyin!** 🚀