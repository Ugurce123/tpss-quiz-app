# 🚀 Vercel + MongoDB Atlas Deployment Rehberi

## Adım 1: MongoDB Atlas Kurulumu

### 1.1 MongoDB Atlas Hesabı Oluşturun
1. [MongoDB Atlas](https://www.mongodb.com/atlas) sitesine gidin
2. "Try Free" butonuna tıklayın
3. Google/GitHub ile giriş yapın veya email ile kayıt olun

### 1.2 Cluster Oluşturun
1. "Build a Database" butonuna tıklayın
2. **FREE** seçeneğini seçin (M0 Sandbox)
3. Cloud Provider: **AWS** (önerilen)
4. Region: **Frankfurt (eu-central-1)** (Türkiye'ye en yakın)
5. Cluster Name: `baggage-quiz-cluster`
6. "Create" butonuna tıklayın

### 1.3 Database User Oluşturun
1. Sol menüden "Database Access" seçin
2. "Add New Database User" butonuna tıklayın
3. Authentication Method: **Password**
4. Username: `baggage-admin`
5. Password: Güçlü bir şifre oluşturun (kaydedin!)
6. Database User Privileges: **Read and write to any database**
7. "Add User" butonuna tıklayın

### 1.4 Network Access Ayarlayın
1. Sol menüden "Network Access" seçin
2. "Add IP Address" butonuna tıklayın
3. "Allow Access from Anywhere" seçin (0.0.0.0/0)
4. "Confirm" butonuna tıklayın

### 1.5 Connection String Alın
1. Sol menüden "Database" seçin
2. Cluster'ınızın yanındaki "Connect" butonuna tıklayın
3. "Connect your application" seçin
4. Driver: **Node.js**, Version: **4.1 or later**
5. Connection string'i kopyalayın:
   ```
   mongodb+srv://baggage-admin:<password>@baggage-quiz-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. `<password>` kısmını gerçek şifrenizle değiştirin

## Adım 2: Vercel Deployment

### 2.1 GitHub Repository Hazırlayın
1. Projenizi GitHub'a push edin:
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

### 2.2 Vercel Hesabı Oluşturun
1. [Vercel](https://vercel.com) sitesine gidin
2. "Sign Up" butonuna tıklayın
3. GitHub hesabınızla giriş yapın

### 2.3 Projeyi Deploy Edin
1. Vercel dashboard'da "New Project" butonuna tıklayın
2. GitHub repository'nizi seçin
3. Project Name: `baggage-quiz-app` (veya istediğiniz isim)
4. Framework Preset: **Other** (otomatik algılanacak)
5. Root Directory: **/** (boş bırakın)
6. "Deploy" butonuna tıklayın

### 2.4 Environment Variables Ekleyin
1. Deploy tamamlandıktan sonra "Settings" sekmesine gidin
2. "Environment Variables" bölümüne gidin
3. Aşağıdaki değişkenleri ekleyin:

**Production Environment Variables:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://baggage-admin:YOUR_PASSWORD@baggage-quiz-cluster.xxxxx.mongodb.net/baggage-quiz?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
CORS_ORIGIN=https://your-app-name.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key-67890
REACT_APP_API_URL=https://your-app-name.vercel.app
```

**Önemli:** 
- `YOUR_PASSWORD` kısmını MongoDB Atlas şifrenizle değiştirin
- `your-app-name` kısmını Vercel'den aldığınız domain ile değiştirin
- JWT_SECRET ve SESSION_SECRET için güçlü, rastgele anahtarlar kullanın

### 2.5 Redeploy Yapın
1. Environment variables ekledikten sonra "Deployments" sekmesine gidin
2. En son deployment'ın yanındaki "..." menüsüne tıklayın
3. "Redeploy" seçin

## Adım 3: Database Verilerini Yükleyin

### 3.1 Production Database'i Hazırlayın
Vercel deployment tamamlandıktan sonra, production database'ine verileri yüklemek için:

1. Local'de production environment ile bağlantı kurun:
   ```bash
   cd server
   # .env dosyasını production MongoDB URI ile güncelleyin
   node create-levels.js
   ```

2. Veya Vercel Functions üzerinden çalıştırın:
   - Vercel dashboard'da "Functions" sekmesine gidin
   - Database initialization endpoint'ini çağırın

## Adım 4: Test ve Doğrulama

### 4.1 Uygulamayı Test Edin
1. Vercel'den aldığınız URL'yi açın (örn: https://baggage-quiz-app.vercel.app)
2. Kayıt olun ve giriş yapın
3. Quiz'leri test edin
4. Admin panelini test edin

### 4.2 Admin Kullanıcısı Oluşturun
Production'da admin kullanıcısı oluşturmak için:
1. Normal kullanıcı olarak kayıt olun
2. MongoDB Atlas'ta "Collections" sekmesine gidin
3. `users` collection'ını açın
4. Kullanıcınızı bulun ve `role` field'ını `"admin"` olarak değiştirin

## Adım 5: Domain ve SSL (Opsiyonel)

### 5.1 Custom Domain Ekleyin
1. Vercel dashboard'da "Settings" > "Domains" sekmesine gidin
2. "Add" butonuna tıklayın
3. Domain'inizi girin ve DNS ayarlarını yapın

### 5.2 SSL Sertifikası
Vercel otomatik olarak SSL sertifikası sağlar, ek bir işlem gerekmez.

## 🎉 Deployment Tamamlandı!

Uygulamanız artık canlıda! 

**Önemli Linkler:**
- Frontend: https://your-app-name.vercel.app
- API: https://your-app-name.vercel.app/api
- MongoDB Atlas: https://cloud.mongodb.com

**Sonraki Adımlar:**
- Performance monitoring ekleyin
- Error tracking (Sentry) entegre edin
- Analytics ekleyin
- Backup stratejisi oluşturun