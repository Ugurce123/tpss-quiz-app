@echo off
echo ========================================
echo   BAGGAGE QUIZ APP BASLATILIYOR
echo ========================================
echo.
echo Server baslatiliyor...
start cmd /k "cd /d C:\Users\UGUR\Desktop\TPSS HAZIRLI MOBIL APP\server && npm run dev"
echo.
echo 5 saniye bekleniyor...
timeout /t 5 /nobreak
echo.
echo Client baslatiliyor...
start cmd /k "cd /d C:\Users\UGUR\Desktop\TPSS HAZIRLI MOBIL APP\client && npm start"
echo.
echo ========================================
echo   UYGULAMA BASLATILDI!
echo   http://localhost:3000
echo ========================================
echo.
pause