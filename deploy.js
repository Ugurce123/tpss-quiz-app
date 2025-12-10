#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Baggage Quiz App Deployment Script');
console.log('=====================================');

// 1. Environment kontrolü
console.log('\n1. Environment dosyalarını kontrol ediliyor...');
const requiredFiles = [
  'server/.env.production',
  'client/.env.production',
  'vercel.json'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Gerekli dosya bulunamadı: ${file}`);
    process.exit(1);
  }
}
console.log('✅ Tüm environment dosyaları mevcut');

// 2. Dependencies kontrolü
console.log('\n2. Dependencies kontrol ediliyor...');
try {
  console.log('Client dependencies...');
  execSync('npm install', { cwd: 'client', stdio: 'inherit' });
  
  console.log('Server dependencies...');
  execSync('npm install', { cwd: 'server', stdio: 'inherit' });
  
  console.log('✅ Dependencies yüklendi');
} catch (error) {
  console.error('❌ Dependencies yüklenirken hata:', error.message);
  process.exit(1);
}

// 3. Build testi
console.log('\n3. Production build testi...');
try {
  execSync('npm run build', { cwd: 'client', stdio: 'inherit' });
  console.log('✅ Client build başarılı');
} catch (error) {
  console.error('❌ Client build hatası:', error.message);
  process.exit(1);
}

// 4. Vercel CLI kontrolü
console.log('\n4. Vercel CLI kontrol ediliyor...');
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI mevcut');
} catch (error) {
  console.log('⚠️  Vercel CLI bulunamadı. Yükleniyor...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI yüklendi');
  } catch (installError) {
    console.error('❌ Vercel CLI yüklenemedi:', installError.message);
    console.log('Manuel olarak yükleyin: npm install -g vercel');
    process.exit(1);
  }
}

console.log('\n🎉 Deployment hazırlığı tamamlandı!');
console.log('\nSonraki adımlar:');
console.log('1. MongoDB Atlas connection string\'ini server/.env.production dosyasına ekleyin');
console.log('2. vercel --prod komutunu çalıştırın');
console.log('3. Environment variables\'ları Vercel dashboard\'dan ekleyin');