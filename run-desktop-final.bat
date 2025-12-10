@echo off
echo 🚀 Baggage Quiz Desktop Uygulaması Başlatılıyor...
echo.

REM Sunucu zaten çalışıyorsa doğrudan Electron'u başlat
echo 📱 Electron uygulaması başlatılıyor...
npx electron electron/main-simple.js

echo.
echo 👋 Uygulama kapatıldı!
echo.
pause