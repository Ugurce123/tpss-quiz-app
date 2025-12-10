const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Baggage Quiz Desktop Uygulaması Başlatılıyor...\n');

// Sunucuyu başlat
console.log('📡 Sunucu başlatılıyor...');
const serverProcess = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

// Sunucunun başlamasını bekle
setTimeout(() => {
  console.log('📝 Client build ediliyor...');
  
  const buildProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit'
  });

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Client build başarılı!');
      console.log('🖥️  Desktop uygulaması başlatılıyor...\n');
      
      const electronProcess = spawn(process.platform === 'win32' ? 'electron.cmd' : 'electron', ['electron/main-prod.js'], {
        cwd: __dirname,
        stdio: 'inherit'
      });

      electronProcess.on('close', () => {
        console.log('👋 Uygulama kapatıldı. Sunucu durduruluyor...');
        serverProcess.kill();
        process.exit(0);
      });
    } else {
      console.error('❌ Client build hatası!');
      serverProcess.kill();
      process.exit(1);
    }
  });
}, 3000);

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n👋 Uygulama kapatılıyor...');
  serverProcess.kill();
  process.exit(0);
});