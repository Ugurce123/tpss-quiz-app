@echo off
:: Sessiz modda çalış - kullanıcıya sadece uygulama göster

:: Başlığı ve çıktıyı gizle
mode con: cols=1 lines=1 >nul 2>&1

:: Arka planda sunucuyu kontrol et ve başlat
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I /N "node.exe">nul
if "%errorlevel%"=="1" (
    :: Sunucu çalışmıyorsa arka planda başlat
    start /min /b cmd /c "cd server && npm start >nul 2>&1"
    timeout /t 3 /nobreak >nul 2>&1
)

:: Client build edilmiş mi kontrol et
if not exist "client\build\index.html" (
    :: Build yoksa arka planda build et
    start /min /b cmd /c "cd client && npm run build >nul 2>&1"
    timeout /t 10 /nobreak >nul 2>&1
)

:: Desktop uygulamasını başlat
start /max npx electron electron/main-simple.js

:: Batch dosyasını kapat
exit