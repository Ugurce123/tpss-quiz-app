# 🔧 Netlify Branch Sorunu - Çözüm

## ❌ Sorun: "Branch to deploy" doldurulamıyor

### Olası Nedenler:
1. Repository henüz seçilmedi
2. GitHub bağlantısı kopuk
3. Repository'de branch yok
4. Yetki sorunu

---

## ✅ ÇÖZÜM 1: Adım Adım Kontrol

### 1. Repository Seçimi
- "Import an existing project" seçtiniz mi?
- "Deploy with GitHub" tıkladınız mı?
- Repository listesinde `baggage-quiz-app` görünüyor mu?
- Repository'yi seçtiniz mi?

### 2. Branch Dropdown
- Repository seçtikten SONRA branch dropdown aktif olmalı
- Dropdown'a tıklayın
- `main` veya `master` görünmeli
- Birini seçin

---

## ✅ ÇÖZÜM 2: Yeniden Başlat

### Adım 1: Sayfayı Yenile
1. Netlify sayfasını yenileyin (F5)
2. "Add new site" → "Import an existing project"
3. "Deploy with GitHub"

### Adım 2: Repository Seç
1. Listede `baggage-quiz-app` bulun
2. Tıklayın
3. Branch dropdown otomatik açılmalı

### Adım 3: Branch Seç
- Dropdown'dan `main` seçin
- Veya `master` (hangisi varsa)

---

## ✅ ÇÖZÜM 3: GitHub Yetkileri

### GitHub Authorization Kontrol:
1. GitHub → Settings → Applications
2. "Authorized OAuth Apps"
3. Netlify'ı bulun
4. Yetkileri kontrol edin
5. Gerekirse "Revoke" → Tekrar authorize

---

## ✅ ÇÖZÜM 4: Manuel Deployment

Eğer hala çalışmıyorsa, manuel yöntem:

### 1. Build Locally
```bash
cd client
npm install
npm run build
```

### 2. Drag & Drop Deploy
1. Netlify → "Sites"
2. "Add new site" → "Deploy manually"
3. `client/build` klasörünü sürükle-bırak

**⚠️ Bu yöntem otomatik deploy olmaz**

---

## 🎯 ALTERNATİF: VERCEL KULLAN

Netlify'da sorun devam ediyorsa:

### Vercel Avantajları:
- ✅ Hem frontend hem backend
- ✅ Tek platform
- ✅ Kolay setup
- ✅ Otomatik SSL

### Vercel'e Geç:
1. https://vercel.com
2. GitHub ile giriş
3. Repository import et
4. Environment variables ekle
5. Deploy

**Vercel'i deneyelim mi?** 🚀

---

## 📸 EKRAN GÖRÜNTÜSÜ YARDIMI

Netlify'da şu ekranı görüyor musunuz?

```
┌─────────────────────────────────────┐
│ Import an existing project         │
├─────────────────────────────────────┤
│ [GitHub] [GitLab] [Bitbucket]      │
└─────────────────────────────────────┘
```

Sonra:

```
┌─────────────────────────────────────┐
│ Select repository                   │
├─────────────────────────────────────┤
│ 🔍 Search repositories              │
│                                     │
│ □ baggage-quiz-app                  │
│ □ other-repo                        │
└─────────────────────────────────────┘
```

Sonra:

```
┌─────────────────────────────────────┐
│ Configure your site                 │
├─────────────────────────────────────┤
│ Branch to deploy: [main ▼]         │
│ Base directory: [        ]          │
│ Build command: [        ]           │
│ Publish directory: [        ]       │
└─────────────────────────────────────┘
```

**Hangi ekrandasınız?**

---

## 🆘 HIZLI ÇÖZÜM

### Şu anda ne yapmalısınız:

1. **Netlify'ı kapat**
2. **Vercel'e geç** (daha kolay)
3. Veya **Render.com'da backend'i deploy et** (önce)
4. Sonra Netlify'a dön

**Vercel'i deneyelim mi? Çok daha kolay olacak!** 🚀