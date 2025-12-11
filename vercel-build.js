#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Client build
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm ci', { stdio: 'inherit' });
  
  console.log('🔨 Building client...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  // Copy to public
  console.log('📁 Copying build to public...');
  const buildDir = path.join(__dirname, 'client', 'build');
  const publicDir = path.join(__dirname, 'public');
  
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true });
  }
  
  if (fs.existsSync(buildDir)) {
    fs.cpSync(buildDir, publicDir, { recursive: true });
    console.log('✅ Vercel build completed successfully!');
  } else {
    throw new Error('Client build directory not found!');
  }
  
} catch (error) {
  console.error('❌ Vercel build failed:', error.message);
  process.exit(1);
}