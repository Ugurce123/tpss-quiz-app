#!/usr/bin/env node

/**
 * Otomatik Deployment Script
 * Bu script deployment sürecini kolaylaştırır
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Baggage Quiz App - Otomatik Deployment Script');
console.log('================================================\n');

// Deployment durumunu kontrol et
function checkDeploymentReadiness() {
  console.log('📋 Deployment hazırlığı kontrol ediliyor...\n');
  
  const requiredFiles = [
    'vercel.json',
    'server/init-production-db.js',
    'server/routes/init.js',
    'client/package.json',
    'server/package.json'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - Mevcut`);
    } else {
      console.log(`❌ ${file} - Eksik`);
      allFilesExist = false;
    }
  });
  
  if (allFilesExist) {
    console.log('\n🎉 Tüm deployment dosyaları hazır!\n');
    return true;
  } else {
    console.log('\n❌ Bazı dosyalar eksik. Lütfen eksik dosyaları oluşturun.\n');
    return false;
  }
}

// Environment variables template oluştur
function generateEnvTemplate() {
  console.log('📝 Environment variables template oluşturuluyor...\n');
  
  const envTemplate = `# VERCEL ENVIRONMENT VARIABLES
# Bu değerleri Vercel dashboard'da ayarlayın

NODE_ENV=production

# MongoDB Atlas Connection String
# Atlas'tan aldığınız connection string'i buraya yapıştırın
MONGODB_URI=mongodb+srv://baggage-admin:YOUR_PASSWORD@baggage-quiz-cluster.xxxxx.mongodb.net/baggage-quiz?retryWrites=true&w=majority

# JWT Secret - Güçlü bir anahtar oluşturun
JWT_SECRET=baggage-quiz-super-secret-jwt-key-2024-production-${Math.random().toString(36).substring(7)}

# CORS Origin - Vercel domain'inizi buraya yazın
CORS_ORIGIN=https://YOUR_VERCEL_DOMAIN.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=baggage-quiz-session-secret-2024-${Math.random().toString(36).substring(7)}

# React App API URL - Vercel domain'inizi buraya yazın
REACT_APP_API_URL=https://YOUR_VERCEL_DOMAIN.vercel.app
`;

  fs.writeFileSync('VERCEL_ENV_TEMPLATE.txt', envTemplate);
  console.log('✅ VERCEL_ENV_TEMPLATE.txt oluşturuldu');
  console.log('   Bu dosyayı Vercel dashboard\'da environment variables olarak ekleyin\n');
}

// Deployment talimatları
function showDeploymentInstructions() {
  console.log('📖 DEPLOYMENT TALİMATLARI');
  console.log('==========================\n');
  
  console.log('1️⃣ MONGODB ATLAS:');
  console.log('   🔗 https://www.mongodb.com/atlas');
  console.log('   • "Try Free" ile hesap oluşturun');
  console.log('   • FREE cluster (M0) oluşturun');
  console.log('   • Database user: baggage-admin');
  console.log('   • Network access: 0.0.0.0/0');
  console.log('   • Connection string\'i kopyalayın\n');
  
  console.log('2️⃣ GITHUB:');
  console.log('   🔗 https://github.com');
  console.log('   • Repository oluşturun');
  console.log('   • Dosyaları yükleyin (drag & drop veya GitHub Desktop)\n');
  
  console.log('3️⃣ VERCEL:');
  console.log('   🔗 https://vercel.com');
  console.log('   • GitHub ile giriş yapın');
  console.log('   • "New Project" → Repository seçin');
  console.log('   • VERCEL_ENV_TEMPLATE.txt\'deki değişkenleri ekleyin');
  console.log('   • "Deploy" butonuna tıklayın\n');
  
  console.log('4️⃣ DATABASE INITIALIZE:');
  console.log('   Deploy tamamlandıktan sonra:');
  console.log('   curl -X POST https://YOUR_DOMAIN.vercel.app/api/init/database\n');
  
  console.log('5️⃣ TEST:');
  console.log('   • Ana sayfa: https://YOUR_DOMAIN.vercel.app');
  console.log('   • Admin: username "admin", password "admin123"\n');
}

// Ana fonksiyon
function main() {
  const isReady = checkDeploymentReadiness();
  
  if (isReady) {
    generateEnvTemplate();
    showDeploymentInstructions();
    
    console.log('🎯 SONRAKI ADIMLAR:');
    console.log('==================');
    console.log('1. MongoDB Atlas hesabı oluşturun');
    console.log('2. GitHub\'a dosyaları yükleyin');
    console.log('3. Vercel\'de deploy edin');
    console.log('4. Database\'i initialize edin');
    console.log('5. Test edin ve kullanmaya başlayın!\n');
    
    console.log('📞 YARDIM:');
    console.log('Detaylı rehber için: DEPLOYMENT_SUMMARY.md');
    console.log('Hızlı başlangıç için: QUICK_DEPLOY.md\n');
    
    console.log('🎉 Deployment hazırlığı tamamlandı!');
  }
}

// Script'i çalıştır
main();