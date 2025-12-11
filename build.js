const fs = require('fs');
const path = require('path');

console.log('🚀 Copying client build to public...');

// Copy client build to public folder
const buildDir = path.join(__dirname, 'client', 'build');
const publicDir = path.join(__dirname, 'public');

if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true });
}

if (fs.existsSync(buildDir)) {
  fs.cpSync(buildDir, publicDir, { recursive: true });
  console.log('✅ Build completed!');
} else {
  console.error('❌ Client build directory not found!');
  process.exit(1);
}