' Baggage Quiz Desktop - Tamamen Gizli Başlatıcı v2.0
' Author: Baggage Quiz Team
' Version: 2.0 - Tamamen görünmez başlatıcı

Set WshShell = CreateObject("WScript.Shell")

' Mevcut dizini al
strPath = WshShell.CurrentDirectory

' Gerekli dosyaların yolları
electronPath = strPath & "\node_modules\.bin\electron.cmd"
mainJsPath = strPath & "\electron\main-simple.js"

' Node.js kontrolü - WMI kullanarak daha güvenli kontrol
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colProcesses = objWMIService.ExecQuery("SELECT * FROM Win32_Process WHERE Name = 'node.exe'")

If colProcesses.Count = 0 Then
    ' Sunucu çalışmıyorsa başlat - TAMAMEN GİZLİ
    serverPath = strPath & "\server"
    WshShell.Run "cmd /c cd """ & serverPath & """ && npm start", 0, False
    WScript.Sleep 5000 ' 5 saniye bekle (daha güvenli)
End If

' Client build kontrolü
Set fso = CreateObject("Scripting.FileSystemObject")
clientBuildPath = strPath & "\client\build\index.html"
If Not fso.FileExists(clientBuildPath) Then
    ' Build yoksa oluştur - TAMAMEN GİZLİ
    clientPath = strPath & "\client"
    WshShell.Run "cmd /c cd """ & clientPath & """ && npm run build", 0, False
    WScript.Sleep 10000 ' 10 saniye bekle (build için yeterli süre)
End If

' Ana uygulamayı başlat - TAMAMEN GİZLİ
WshShell.Run "cmd /c npx electron """ & mainJsPath & """", 0, False

' Obje temizliği
Set WshShell = Nothing
Set objWMIService = Nothing
Set colProcesses = Nothing
Set fso = Nothing

' Tamamen sessiz çıkış
WScript.Quit(0)