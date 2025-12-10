@echo off
echo Baggage Quiz Desktop Uygulaması Başlatılıyor...
echo.

REM Sunucuyu başlat
echo Sunucu başlatılıyor...
cd server
start cmd /k "npm start"
cd ..

REM 5 saniye bekle (sunucunun başlaması için)
echo Sunucunun başlaması bekleniyor...
timeout /t 5 /nobreak > nul

REM Client'ı build et
echo Client build ediliyor...
cd client
npm run build
if %errorlevel% neq 0 (
    echo ❌ Client build hatası!
    pause
    exit /b 1
)
cd ..

REM Electron uygulamasını başlat
echo Desktop uygulaması başlatılıyor...
call npx electron electron/main-prod.js
if %errorlevel% neq 0 (
    echo ❌ Electron başlatma hatası!
    echo Electron yüklü mü? Kontrol edin: npm list electron
    pause
    exit /b 1
)

echo.
echo ✅ Uygulama başlatıldı!
echo.
pause