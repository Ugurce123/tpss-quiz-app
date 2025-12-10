## Amaç
Monorepo yapıyı Vercel’de tek projede çalışacak şekilde düzenlemek: istemciyi statik olarak derlemek, `/api/*` isteklerini sunucusuz Node işlevine yönlendirmek ve üretim ortamı güvenlik/başlıklarını Vercel’e göre yapılandırmak.

## Yapılacak Değişiklikler
1. Sunucuyu Vercel işlev uyumlu hale getirme (modül dışa aktarma ve koşullu `listen`).
2. İstemci API taban URL’sini ortam yoksa aynı origin’e düşecek şekilde güncelleme.
3. Kök `vercel.json` ile build ve yönlendirmeleri tanımlama: `@vercel/static-build` + `@vercel/node` ve SPA fallback.
4. CORS ve CSP’yi ortam bazlı (dev/prod) yapılandırma; Vercel domainleri ve aynı origin’e izin.
5. Statik varlık yönlendirmeleri: `static/*`, `manifest.json`, `asset-manifest.json`, `favicon.ico`.
6. Üretim ortam değişkenleri: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, hız sınırlama ve güvenlik ayarları.

## Teknik Uygulama
- `server/index.js`
  - `if (require.main === module) app.listen(PORT, ...)` koşulu eklenir.
  - `module.exports = app` ile uygulama dışa aktarılır.
  - `helmet` içinde `connectSrc` ve `cors` origin listesi dev/prod ayrımlı ve `CORS_ORIGIN` destekli hale getirilir.
- `client/src/config/api.js`
  - `REACT_APP_API_URL` yoksa `window.location.origin` tabanı kullanılır; çağrılar `/api` altında yapılır.
- `vercel.json`
  - `builds`: `client/package.json` için `@vercel/static-build` (`distDir: build`), API için `@vercel/node` (`server/index.js`).
  - `routes`: `/api/(.*)` → `/server/index.js`, statik varlıklar ve SPA fallback.

## Ortam Değişkenleri
- Vercel Proje Ayarları → Environment:
  - `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` (proje domaini), `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`, `BCRYPT_ROUNDS`, `SESSION_SECRET`.
  - İstemci için opsiyonel `REACT_APP_API_URL` (aynı origin kullanılacaksa gerekmez).

## Doğrulama
- Vercel’de deploy sonrası:
  - `GET /api/init/...` ve `GET /health` ile backend sağlığı.
  - İstemci üzerinden login/quiz akışları; isteklerin aynı origin `/api/*`’ye gittiğini ve CORS/CSP engeli olmadığını kontrol.
  - Statik varlıkların (manifest, asset-manifest, static/*) doğru servis edildiğini test.

## Notlar ve Riskler
- Vercel dosya sistemi kalıcı değildir; `uploads/` için üretimde S3/Supabase/Cloudinary entegrasyonu önerilir.
- Güvenlik başlıkları (CSP) gereksizce kısıtlıysa üçüncü parti kaynaklar için izinlerin genişletilmesi gerekebilir.

Onaylarsanız bu değişiklikleri uygulayıp yerel/preview doğrulamalarını gerçekleştireceğim.