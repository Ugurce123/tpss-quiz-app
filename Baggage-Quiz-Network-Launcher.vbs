' Baggage Quiz Desktop - Ağ (Network) Başlatıcı
' Ortak ağ üzerinden çalışma için özel versiyon
' Author: Baggage Quiz Team
' Version: 3.0 - Network Compatible

Set WshShell = CreateObject("WScript.Shell")
Set Network = CreateObject("WScript.Network")

' Ağ konfigürasyonu - KULLANICININ DEĞİŞTİRMESİ GEREKEN ALANLAR
' Ağ paylaşım yolu örneği: \\SunucuAdi\PaylasimKlasoru\BaggageQuiz
' Veya harita edilmiş sürücü: Z:\BaggageQuiz

' AĞ YOLU AYARI - BURAYI KENDİ AĞ YOLUNUZA GÖRE DEĞİŞTİRİN
networkPath = "\\SunucuAdi\PaylasimKlasoru\BaggageQuiz" ' ÖRNEK - DEĞİŞTİRİN!
' Alternatif: networkPath = "Z:\BaggageQuiz" ' Haritalı sürücü kullanıyorsanız

' Yerel yol kontrolü - Eğer ağ yolu ulaşılabilir değilse yerel klasörü kullan
Set fso = CreateObject("Scripting.FileSystemObject")
If fso.FolderExists(networkPath) Then
    strPath = networkPath
    WScript.Echo "✅ Ağ konumu bulundu: " & strPath
Else
    ' Yerel klasörü kullan (mevcut dizin)
    strPath = WshShell.CurrentDirectory
    WScript.Echo "⚠️  Ağ konumu bulunamadı, yerel klasör kullanılıyor: " & strPath
End If

' Gerekli dosyaların yolları
electronPath = strPath & "\node_modules\.bin\electron.cmd"
mainJsPath = strPath & "\electron\main-simple.js"
serverPath = strPath & "\server"
clientPath = strPath & "\client"
clientBuildPath = strPath & "\client\build\index.html"

WScript.Echo "📁 Kullanılan yol: " & strPath

' Node.js kontrolü - WMI kullanarak daha güvenli kontrol
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colProcesses = objWMIService.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'node.exe'")

If colProcesses.Count = 0 Then
    ' Sunucu çalışmıyorsa başlat - TAMAMEN GİZLİ
    WScript.Echo "🚀 Sunucu başlatılıyor..."
    WshShell.Run "cmd /c cd """ & serverPath & """ && npm start", 0, False
    WScript.Sleep 5000 ' 5 saniye bekle (ağ için daha uzun süre)
Else
    WScript.Echo "✅ Sunucu zaten çalışıyor"
End If

' Client build kontrolü
If Not fso.FileExists(clientBuildPath) Then
    ' Build yoksa oluştur - TAMAMEN GİZLİ
    WScript.Echo "🔨 Client build oluşturuluyor..."
    WshShell.Run "cmd /c cd """ & clientPath & """ && npm run build", 0, False
    WScript.Sleep 15000 ' 15 saniye bekle (ağ için daha uzun süre)
Else
    WScript.Echo "✅ Client build hazır"
End If

' Ana uygulamayı başlat - TAMAMEN GİZLİ
WScript.Echo "🎯 Electron uygulaması başlatılıyor..."
WshShell.Run "cmd /c npx electron """ & mainJsPath & """", 0, False

WScript.Echo "✅ Başlatıcı tamamlandı! Uygulama açılıyor..."
WScript.Sleep 2000 ' Kullanıcıya mesaj gösterme süresi

' Obje temizliği
Set WshShell = Nothing
Set Network = Nothing
Set objWMIService = Nothing
Set colProcesses = Nothing
Set fso = Nothing

' Tamamen sessiz çıkış
WScript.Quit(0)