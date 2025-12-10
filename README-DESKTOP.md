# Baggage Quiz App - Desktop Version

Bu proje, web tabanlı Baggage Quiz uygulamasının Electron ile masaüstü versiyonudur.

## Özellikler

- 🖥️ **Masaüstü Uygulaması**: Windows, Mac ve Linux'ta çalışır
- 🚀 **Otomatik Sunucu Başlatma**: Yerel Express sunucusu otomatik olarak başlar
- 💾 **Çevrimdışı Çalışma**: İnternet bağlantısı gerektirmez
- 🎨 **Modern Arayüz**: React ile geliştirilmiş responsive tasarım
- 📊 **Seviye Tabanlı Quiz**: Başlangıçtan ileri seviyeye kademeli öğrenme
- 📈 **İstatistikler**: Detaylı performans analizi
- 👨‍💼 **Admin Paneli**: Soru ve kullanıcı yönetimi

## Kurulum

### Gereksinimler
- Node.js (v18.0.0 veya üzeri)
- npm (v8.0.0 veya üzeri)

### Kurulum Adımları

1. **Projeyi indirin veya klonlayın**
```bash
git clone [proje-url]
cd baggage-quiz-app
```

2. **Bağımlılıkları yükleyin**
```bash
npm run install:all
```

## Kullanım

### Geliştirme Modu
```bash
npm run electron:dev
```
Bu komut:
- React client'ı başlatır (port 3000)
- Express sunucusunu başlatır (port 5000)
- Electron uygulamasını başlatır

### Üretim Build
```bash
npm run electron:build
```
Bu komut:
- React uygulamasını build eder
- Electron uygulamasını paketler
- Platforma özel installer oluşturur

### Platforma Özel Build
- **Windows**: `npm run dist:win`
- **Mac**: `npm run dist:mac`
- **Linux**: `npm run dist:linux`

## Masaüstü Özellikleri

### Menü Çubuğu
- **Dosya**: Yeni quiz, Çıkış
- **Görünüm**: Yenile, Tam ekran, Geliştirici araçları
- **Yardım**: Hakkında

### Kısayollar
- `Ctrl/Cmd + N`: Yeni quiz
- `Ctrl/Cmd + R`: Yenile
- `F11`: Tam ekran
- `Ctrl/Cmd + Q`: Çıkış

### Desktop Info Component
Uygulama masaüstü modunda çalıştığında, kullanıcı arayüzünde özel bir bilgi paneli görünür.

## Dosya Yapısı

```
baggage-quiz-app/
├── electron/                 # Electron dosyaları
│   ├── main.js              # Ana Electron süreci
│   └── preload.js           # Preload script (güvenlik)
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/      # React component'leri
│   │   ├── pages/          # Sayfa component'leri
│   │   ├── config/         # Konfigürasyon dosyaları
│   │   └── ...
│   └── package.json
├── server/                   # Express backend
│   ├── index.js            # Ana sunucu dosyası
│   ├── routes/             # API route'ları
│   ├── models/             # Veri modelleri
│   └── ...
└── package.json             # Ana package.json
```

## Teknik Detaylar

### Electron Konfigürasyonu
- **Context Isolation**: Güvenlik için aktif
- **Node Integration**: Güvenlik için devre dışı
- **Preload Script**: Güvenli IPC iletişimi sağlar

### API Bağlantısı
- Desktop modunda: `http://localhost:5000`
- Web modunda: Relative URL'ler kullanır

### Güvenlik
- Context isolation aktif
- Preload script ile güvenli IPC
- Node.js API'leri doğrudan expose edilmez

## Sorun Giderme

### Sunucu Başlatılmıyor
- Port 5000'ün başka bir uygulama tarafından kullanılmadığını kontrol edin
- `server/.env` dosyasının varlığını kontrol edin

### Build Hataları
- Node.js versiyonunuzun 18.0.0 veya üzeri olduğundan emin olun
- Tüm bağımlılıkların yüklü olduğunu kontrol edin

### Electron Açılmıyor
- Geliştirici modunda çalıştırmayı deneyin: `npm run electron:dev`
- Console'da hata mesajlarını kontrol edin

## Lisans
MIT Lisansı - Detaylar için LICENSE dosyasına bakın.