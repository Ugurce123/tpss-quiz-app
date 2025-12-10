# Google Photos URL Alma Rehberi

## Adım 1: Google Photos'ta Görseli Açın
1. https://photos.google.com adresine gidin
2. Kullanmak istediğiniz görseli bulun ve açın

## Adım 2: URL'yi Kopyalayın
1. Görsel açıkken tarayıcının adres çubuğundaki URL'yi kopyalayın
2. URL şu formatta olmalı:
   ```
   https://photos.google.com/u/1/search/.../photo/AF1QipMVG2-vU-6VzljXVswf0LZdl-rWMGihE7E64EA
   ```

## Adım 3: Admin Panel'de Kullanın
1. Admin Panel → Soru Yönetimi → Yeni Soru Ekle
2. "Görsel URL" alanına kopyaladığınız URL'yi yapıştırın
3. Sistem otomatik olarak şu formata çevirecek:
   ```
   https://lh3.googleusercontent.com/AF1QipMVG2-vU-6VzljXVswf0LZdl-rWMGihE7E64EA=w500-h400
   ```

## URL Formatları

### ✅ Desteklenen Google Photos URL'leri:
- `https://photos.google.com/u/1/search/.../photo/PHOTO_ID`
- `https://photos.google.com/share/.../photo/PHOTO_ID`
- `https://photos.google.com/photo/PHOTO_ID`

### ✅ Otomatik Dönüştürülen Format:
- `https://lh3.googleusercontent.com/PHOTO_ID=w500-h400`

### ❌ Çalışmayan Formatlar:
- Blob URL'leri: `blob:https://...`
- Private/Protected URL'ler

## Önemli Notlar
1. **Görsel Gizliliği**: Google Photos'taki görselin paylaşım ayarlarını kontrol edin
2. **Boyut**: Sistem otomatik olarak 500x400 boyutunda gösterir
3. **Performans**: Google'ın CDN'i sayesinde hızlı yüklenir

## Alternatif Boyutlar
URL sonundaki `=w500-h400` kısmını değiştirerek farklı boyutlar alabilirsiniz:
- `=w300-h200` (küçük)
- `=w800-h600` (büyük)
- `=s400` (kare, 400x400)

## Test
Admin Panel'de URL'yi yapıştırdığınızda önizleme göreceksiniz. Eğer görsel yüklenmezse:
1. Google Photos'ta görselin paylaşım ayarlarını kontrol edin
2. URL'nin doğru kopyalandığından emin olun
3. Alternatif olarak Unsplash veya Imgur kullanın