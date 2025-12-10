# Baggage Quiz - Ortak Ağ (Network) Kullanım Kılavuzu

## AĞ YAPISI KURULUMU

### 1. Temel Gereksinimler
- Tüm kullanıcılar aynı ağda olmalı
- Network paylaşımı aktif olmalı
- Node.js yüklü olmalı (tüm bilgisayarlarda)

### 2. Kurulum Seçenekleri

#### Seçenek A: Sunucu Üzerinden Paylaşım
```
Sunucu Bilgisayarı:
- Tüm proje dosyaları sunucuda bulunur
- Paylaşım klasörü: \\SunucuAdi\BaggageQuiz
- Herkes bu paylaşıma erişir
```

#### Seçenek B: Haritalı Sürücü (Mapped Drive)
```
Her Kullanıcı:
- Z: sürücüsü olarak haritalar
- Z:\BaggageQuiz klasörüne erişir
```

### 3. VBScript Yapılandırması

`Baggage-Quiz-Network-Launcher.vbs` dosyasını açın ve şu satırı kendi ağ yolunuza göre değiştirin:

```vbscript
' AĞ YOLU AYARI - BURAYI KENDİ AĞ YOLUNUZA GÖRE DEĞİŞTİRİN
networkPath = "\\SunucuAdi\PaylasimKlasoru\BaggageQuiz" ' BURAYI DEĞİŞTİRİN!
```

### 4. Örnek Yapılandırmalar

#### Örnek 1: Sunucu Adı ile
```vbscript
networkPath = "\\OFFICE-SERVER\SharedApps\BaggageQuiz"
```

#### Örnek 2: IP Adresi ile
```vbscript
networkPath = "\\192.168.1.100\SharedApps\BaggageQuiz"
```

#### Örnek 3: Haritalı Sürücü
```vbscript
networkPath = "Z:\BaggageQuiz"
```

### 5. Güvenlik Ayarları

#### Windows Güvenlik Duvarı
- Node.js (port 5000) için izin verin
- File and Printer Sharing aktif olmalı

#### Klasör İzinleri
- Everyone: Read & Execute
- Administrators: Full Control

### 6. Veri Alışverişi

#### Ortak Veritabanı
- Tüm kullanıcılar aynı MongoDB/Sunucu veritabanına bağlanır
- Quiz sonuçları, kullanıcı bilgileri merkezi olarak saklanır

#### Senkronizasyon
- Kullanıcı A quiz çözer → Sunucuya kaydedilir
- Kullanıcı B giriş yapar → Aynı verileri görür

### 7. Sorun Giderme

#### Bağlantı Hatası
```
Hata: Ağ konumu bulunamadı
Çözüm: 
1. Sunucu adını kontrol edin
2. Paylaşım izinlerini kontrol edin
3. Ağ bağlantısını test edin
```

#### Erişim Hatası
```
Hata: Erişim reddedildi
Çözüm:
1. Klasör izinlerini kontrol edin
2. Windows güvenlik duvarını kontrol edin
3. Kullanıcı hesaplarını kontrol edin
```

### 8. Test Komutları

```cmd
# Ağ bağlantısını test et
ping SunucuAdi

# Paylaşımı test et
dir \\SunucuAdi\PaylasimKlasoru

# Haritalı sürücü test et
dir Z:\BaggageQuiz
```

### 9. Performans İpuçları

- Sunucu güçlü bir bilgisayar olmalı
- Tüm kullanıcılar aynı Node.js versiyonunu kullanmalı
- Ağ hızı minimum 100Mbps olmalı
- Sunucuda SSD disk tavsiye edilir

### 10. Backup (Yedekleme)

Sunucu bilgisayarında düzenli yedekleme yapın:
- uploads/ klasörü (resim dosyaları)
- MongoDB veritabanı
- Kullanıcı dosyaları