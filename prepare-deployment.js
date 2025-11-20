#!/usr/bin/env node

/**
 * DEPLOYMENT PREPARATION SCRIPT
 * This script prepares the project for deployment to Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 TPSS HAZIRLIK MOBİL APP - DEPLOYMENT HAZIRLIĞI\n');
console.log('=' .repeat(60));

// Check if required files exist
const requiredFiles = [
  'vercel.json',
  'client/package.json',
  'server/package.json',
  'server/index.js',
  'client/src/App.js',
  '.gitignore'
];

console.log('\n✅ Gerekli Dosyalar Kontrol Ediliyor...\n');

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ Bazı gerekli dosyalar eksik!');
  process.exit(1);
}

console.log('\n✅ Tüm gerekli dosyalar mevcut!\n');

// Check environment files
console.log('📋 Environment Dosyaları:\n');
console.log('  ⚠️  server/.env - Production için Vercel\'de ayarlanacak');
console.log('  ⚠️  client/.env.production - Production için Vercel\'de ayarlanacak\n');

// Print deployment instructions
console.log('=' .repeat(60));
console.log('\n📖 DEPLOYMENT ADIMbuild:\n');

console.log('1️⃣  GITHUB UPLOAD:');
console.log('   - GitHub.com\'da yeni repository oluşturun');
console.log('   - Repository adı: tpss-hazirlik-app (veya istediğiniz isim)');
console.log('   - Tüm dosyaları GitHub\'a yükleyin\n');

console.log('2️⃣  MONGODB ATLAS:');
console.log('   - https://www.mongodb.com/atlas adresine gidin');
console.log('   - Ücretsiz hesap oluşturun');
console.log('   - M0 (Free) cluster oluşturun');
console.log('   - Database User oluşturun (username: baggage-admin)');
console.log('   - Network Access: 0.0.0.0/0 (tüm IP\'lere izin ver)');
console.log('   - Connection String\'i kopyalayın\n');

console.log('3️⃣  VERCEL DEPLOYMENT:');
console.log('   - https://vercel.com adresine gidin');
console.log('   - GitHub ile giriş yapın');
console.log('   - "New Project" tıklayın');
console.log('   - GitHub repository\'nizi seçin');
console.log('   - Environment Variables ekleyin (aşağıdaki listeye bakın)');
console.log('   - Deploy butonuna tıklayın\n');

console.log('4️⃣  ENVIRONMENT VARIABLES (Vercel Dashboard):\n');
console.log('   NODE_ENV=production');
console.log('   MONGODB_URI=[MongoDB Atlas Connection String]');
console.log('   JWT_SECRET=tpss-super-secret-jwt-key-2024');
console.log('   CORS_ORIGIN=[Vercel Domain]');
console.log('   REACT_APP_API_URL=[Vercel Domain]');
console.log('   RATE_LIMIT_WINDOW_MS=900000');
console.log('   RATE_LIMIT_MAX_REQUESTS=100');
console.log('   BCRYPT_ROUNDS=12');
console.log('   SESSION_SECRET=tpss-session-secret-2024\n');

console.log('5️⃣  DATABASE INITIALIZE:');
console.log('   Deploy tamamlandıktan sonra:');
console.log('   curl -X POST https://[your-domain].vercel.app/api/init/database\n');

console.log('=' .repeat(60));
console.log('\n✅ PROJE DEPLOYMENT İÇİN HAZIR!\n');
console.log('Yukarıdaki adımları takip ederek projenizi yayınlayabilirsiniz.\n');
