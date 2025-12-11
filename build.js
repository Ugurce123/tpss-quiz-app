const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building client...');

// Client build
execSync('cd client && npm install && npm run build', { stdio: 'inherit' });

// Copy client build to public folder
const buildDir = path.join(__dirname, 'client', 'build');
const publicDir = path.join(__dirname, 'public');

if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true });
}

fs.cpSync(buildDir, publicDir, { recursive: true });

console.log('✅ Build completed!');