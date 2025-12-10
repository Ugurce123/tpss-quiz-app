## Amaç
Vercel olmadan projeyi GitHub Pages üzerinde statik olarak yayınlamak ve API çağrılarını Supabase Edge Functions üzerinden çalıştırmak.

## Yaklaşım
- Frontend: React uygulamasını GitHub Pages’a deploy (HashRouter ile SPA uyumu).
- Backend: Mevcut API uçlarını Supabase Edge Functions alan adında çalıştırmak.
- Depolama: Görseller Supabase Storage (public bucket) üzerinde.

## Gerekli Ayarlar
- İstemci
  - `HashRouter` kullanımı (yapıldı) ve `client/.env.production` içinde `REACT_APP_API_URL=https://<PROJECT_ID>.functions.supabase.co`.
  - `client/package.json` içine `homepage: "https://<github_user>.github.io/<repo_name>/"` eklenmesi.
- Supabase
  - Storage: `uploads` bucket (public)
  - Edge Functions: `auth`, `levels`, `quiz`, `statistics` uçları.
  - Proje ayarlarından `SUPABASE_URL`, `SERVICE_ROLE` alınır; fonksiyonlarda kullanılacak.

## GitHub Yayın Adımları
1. Repo oluştur ve kodu push et:
   - `git init`, `git remote add origin <repo>`, `git add . && git commit`, `git push origin main`.
2. GitHub Pages etkinleştir:
   - Repository Settings → Pages → Deploy from branch → `gh-pages` veya Actions aracılığıyla.
3. GitHub Actions ile otomatik deploy:
   - `.github/workflows/pages.yml` ekle:
     - Node 18 kur
     - `cd client && npm ci && npm run build`
     - `client/build` çıktısını Pages’a deploy.
   - SPA fallback için `404.html` → `index.html` kopyası (GitHub Pages deep-link için).

## Supabase Edge Functions
- Uçlar:
  - `POST /api/auth/login`, `POST /api/auth/register`
  - `GET /api/levels`, admin uçları
  - `GET /api/quiz/start/:levelId`, `POST /api/quiz/submit`
  - `GET /api/statistics/*`
- Deno fonksiyonları içinde Postgres sorguları ve JWT üretimi (veya Supabase Auth kullanımı).

## Doğrulama
- GitHub Pages URL’de `/#/login`, `/#/quiz/1` açılır.
- İstemci Network: istekler `https://<PROJECT_ID>.functions.supabase.co/api/*` alanına gider ve 200 döner.
- Görsel yükleme: Admin Panel’den görsel yükle, Supabase Storage public URL dönmeli ve Quiz ekranında görünmeli.

Onaylarsanız, `homepage` ekleme, GitHub Actions dosyası ve Edge Functions iskeletini hazırlayıp publish sürecini başlatacağım.