# 📁 GitHub Upload Checklist

## ✅ Yüklenmesi Gereken Ana Dosyalar:

### 🔧 Konfigürasyon Dosyaları:
- [ ] `package.json` (root)
- [ ] `vercel.json` (Vercel deployment config)
- [ ] `.gitignore` (Git ignore rules)
- [ ] `README.md` (Proje açıklaması)

### 📱 Client (React) Dosyaları:
- [ ] `client/package.json`
- [ ] `client/public/` (tüm klasör)
- [ ] `client/src/` (tüm klasör ve alt dosyalar)
  - [ ] `client/src/components/`
  - [ ] `client/src/pages/`
  - [ ] `client/src/contexts/`
  - [ ] `client/src/utils/`
  - [ ] `client/src/App.js`
  - [ ] `client/src/index.js`

### 🖥️ Server (Node.js) Dosyaları:
- [ ] `server/package.json`
- [ ] `server/index.js` (Ana server dosyası)
- [ ] `server/models/` (Database models)
- [ ] `server/routes/` (API routes)
- [ ] `server/middleware/` (Security middleware)
- [ ] `server/init-production-db.js` (Database initialization)

### 📖 Deployment Dosyaları:
- [ ] `DEPLOYMENT_SUMMARY.md`
- [ ] `VERCEL_DEPLOYMENT_GUIDE.md`
- [ ] `QUICK_DEPLOY.md`
- [ ] `deployment-helper.html`
- [ ] `auto-deploy.js`
- [ ] `VERCEL_ENV_TEMPLATE.txt`

### ❌ Yüklenmemesi Gereken Dosyalar:
- [ ] `node_modules/` (otomatik ignore)
- [ ] `client/build/` (otomatik ignore)
- [ ] `.env` dosyaları (güvenlik)
- [ ] `server/uploads/` (kullanıcı yüklemeleri)

## 🚀 Upload Sonrası Kontrol:

Repository yüklendikten sonra kontrol edin:
1. ✅ Ana dosyalar görünüyor mu?
2. ✅ Klasör yapısı doğru mu?
3. ✅ README.md düzgün görünüyor mu?
4. ✅ package.json dosyaları mevcut mu?

## 📞 Sorun Yaşarsanız:

### Dosya Boyutu Sorunu:
- node_modules klasörünü silip tekrar deneyin
- .gitignore dosyasının çalıştığından emin olun

### Upload Hatası:
- Dosyaları küçük gruplar halinde yükleyin
- GitHub Desktop kullanmayı deneyin

### Eksik Dosyalar:
- Bu checklist'i kullanarak kontrol edin
- Önemli dosyaların eksik olmadığından emin olun

## 🎯 Sonraki Adım:
Repository hazır olduğunda Vercel deployment'a geçin!