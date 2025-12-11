# Vercel Environment Variables Kontrol

## Gerekli Environment Variables:

1. **MONGODB_URI**
   ```
   mongodb+srv://ugur%20çelik:Saw-Tpss.01@baggage-quiz-cluster.to5bpqn.mongodb.net/baggage-quiz?retryWrites=true&w=majority
   ```

2. **JWT_SECRET**
   ```
   24a8e73ae959f18afe45aae67afc9ba80b7d15276003c4ceb13ba43315ac3d6a725c6639f6a2dcea158198af63859c27fba6f30fe77255e2ecc2f2e798a1e4d1
   ```

3. **NODE_ENV**
   ```
   production
   ```

4. **CORS_ORIGIN** (opsiyonel)
   ```
   https://tpss-quiz-app.vercel.app
   ```

## Vercel Dashboard'da Ayarlanması Gerekenler:

1. Project Settings > Environment Variables
2. Yukarıdaki değişkenleri ekle
3. Production, Preview ve Development için aynı değerleri kullan
4. Deploy et

## Build Command Override:
Vercel Dashboard > Settings > General > Build & Development Settings:
- Build Command: `npm run vercel-build`
- Output Directory: `public`
- Install Command: `npm install`

## Son Deployment Durumu:
- GitHub repo: https://github.com/Ugurce123/tpss-quiz-app
- Vercel URL: https://tpss-quiz-app.vercel.app
- Son commit: d69debc