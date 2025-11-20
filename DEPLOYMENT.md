# 🚀 Baggage Quiz App - Deployment Guide

## Ücretsiz Hosting Seçenekleri

### 1. Vercel + MongoDB Atlas (Önerilen)

#### Adım 1: MongoDB Atlas Kurulumu
1. [MongoDB Atlas](https://www.mongodb.com/atlas) hesabı oluşturun
2. Ücretsiz cluster oluşturun (512MB)
3. Database user oluşturun
4. IP whitelist'e `0.0.0.0/0` ekleyin (tüm IP'ler)
5. Connection string'i kopyalayın

#### Adım 2: Vercel Deployment
1. [Vercel](https://vercel.com) hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Environment variables ekleyin:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/baggage-quiz
   JWT_SECRET=your-super-secret-key
   NODE_ENV=production
   ```
4. Deploy butonuna tıklayın

#### Adım 3: Domain Ayarları
1. Vercel'den aldığınız URL'i kopyalayın
2. `client/.env.production` dosyasında `REACT_APP_API_URL` güncelleyin
3. `server/.env.production` dosyasında `ALLOWED_ORIGINS` güncelleyin

### 2. Netlify + Railway + MongoDB Atlas

#### Frontend (Netlify)
1. [Netlify](https://netlify.com) hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Build settings:
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`

#### Backend (Railway)
1. [Railway](https://railway.app) hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Environment variables ekleyin
4. Deploy

### 3. Render (Full-Stack)

1. [Render](https://render.com) hesabı oluşturun
2. Web Service oluşturun
3. GitHub repository'nizi bağlayın
4. Build ve start komutları:
   ```
   Build: npm install && cd client && npm install && npm run build
   Start: cd server && npm start
   ```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production
PORT=5001
ALLOWED_ORIGINS=https://your-frontend-url.com
```

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

## Deployment Checklist

- [ ] MongoDB Atlas cluster oluşturuldu
- [ ] Database user ve password ayarlandı
- [ ] Environment variables ayarlandı
- [ ] Frontend build testi yapıldı
- [ ] Backend production testi yapıldı
- [ ] CORS ayarları güncellendi
- [ ] SSL sertifikası aktif
- [ ] Custom domain bağlandı (opsiyonel)

## Güvenlik Kontrolleri

- [ ] JWT secret güçlü ve unique
- [ ] MongoDB IP whitelist ayarlandı
- [ ] Rate limiting aktif
- [ ] HTTPS zorunlu
- [ ] Environment variables güvenli
- [ ] Error messages production-ready

## Monitoring

- [ ] Uptime monitoring (UptimeRobot)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Database monitoring

## Backup

- [ ] MongoDB Atlas otomatik backup aktif
- [ ] Code GitHub'da yedekli
- [ ] Environment variables güvenli yerde saklanıyor

## Troubleshooting

### Yaygın Sorunlar

1. **CORS Error**: `ALLOWED_ORIGINS` environment variable'ını kontrol edin
2. **Database Connection**: MongoDB URI'nin doğru olduğundan emin olun
3. **Build Error**: Node.js versiyonunu kontrol edin (>=18)
4. **API 404**: Backend URL'inin doğru olduğundan emin olun

### Log Kontrolü

- Vercel: Dashboard > Functions > View Logs
- Railway: Dashboard > Deployments > Logs
- Netlify: Dashboard > Site > Functions

## Maliyet

- **MongoDB Atlas**: 512MB ücretsiz
- **Vercel**: 100GB bandwidth ücretsiz
- **Netlify**: 100GB bandwidth ücretsiz
- **Railway**: $5/ay ücretsiz kredi
- **Render**: 750 saat/ay ücretsiz

## Performans Optimizasyonu

- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] CDN kullanımı
- [ ] Gzip compression
- [ ] Database indexing

## Scaling

Uygulama büyüdükçe:
1. MongoDB Atlas paid plan
2. Vercel Pro plan
3. CDN ekleme
4. Load balancing
5. Database sharding