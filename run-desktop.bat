@echo off
echo Baggage Quiz Desktop Uygulaması Başlatılıyor...
echo.

REM Sunucuyu başlat
echo Sunucu başlatılıyor...
start cmd /k "cd server && npm start"

REM 3 saniye bekle (sunucunun başlaması için)
timeout /t 3 /nobreak > nul

REM Client'ı build et
echo Client build ediliyor...
cd client && npm run build

REM Electron uygulamasını başlat
echo Desktop uygulaması başlatılıyor...
cd ..
electron electron/main-prod.js

echo.
echo Uygulama başlatıldı!
echo.
pause