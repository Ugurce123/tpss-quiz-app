# 🧪 Admin Özellikleri Test Rehberi

**Tarih:** $(date)
**Durum:** ✅ HAZIR

---

## 🎯 Test Edilecek Özellikler

### 1. 🔐 Kullanıcı Şifresi Değiştirme
### 2. 🗑️ Kullanıcı Silme
### 3. ✅ Kullanıcı Onaylama
### 4. ❌ Kullanıcı Onayını Kaldırma

---

## 📋 Test Adımları

### Hazırlık:
1. ✅ Server çalışıyor (Port 5001)
2. ✅ Client çalışıyor (Port 3000)
3. ✅ Admin olarak giriş yapın:
   - Username: `admin@baggage-quiz.com`
   - Password: `Ugur.Saw-123`

---

## Test 1: Kullanıcı Şifresi Değiştirme

### Adımlar:
1. **Admin Paneline Gidin**
   - URL: http://localhost:3000/admin
   
2. **Kullanıcılar Sekmesine Tıklayın**
   - Üstteki tab'lardan "Kullanıcılar" seçin

3. **Test Kullanıcısı Seçin**
   - Admin olmayan bir kullanıcı bulun
   - "Şifre Değiştir" butonuna tıklayın

4. **Yeni Şifre Girin**
   - Modal açılacak
   - Yeni şifre: `test123`
   - "Şifreyi Değiştir" butonuna tıklayın

5. **Doğrulama**
   - ✅ Başarı mesajı görünmeli
   - ✅ Modal kapanmalı
   - ✅ Kullanıcı yeni şifre ile giriş yapabilmeli

### Beklenen Sonuç:
```
✅ Kullanıcı şifresi başarıyla değiştirildi!
```

---

## Test 2: Kullanıcı Silme

### Adımlar:
1. **Admin Paneline Gidin**
   - URL: http://localhost:3000/admin

2. **Kullanıcılar Sekmesine Tıklayın**

3. **Test Kullanıcısı Seçin**
   - Admin olmayan bir kullanıcı bulun
   - "Sil" butonuna tıklayın

4. **Onay Mesajını Kabul Edin**
   - Confirm dialog açılacak
   - "OK" tıklayın

5. **Doğrulama**
   - ✅ Başarı mesajı görünmeli
   - ✅ Kullanıcı listeden silinmeli
   - ✅ Sayfa yenilendiğinde kullanıcı olmamalı

### Beklenen Sonuç:
```
✅ [username] kullanıcısı başarıyla silindi!
```

---

## Test 3: Kullanıcı Onaylama

### Adımlar:
1. **Yeni Kullanıcı Oluşturun**
   - Logout yapın
   - Register sayfasına gidin
   - Yeni kullanıcı oluşturun

2. **Admin Olarak Giriş Yapın**
   - Username: `admin@baggage-quiz.com`
   - Password: `Ugur.Saw-123`

3. **Admin Paneline Gidin**
   - Kullanıcılar sekmesine tıklayın

4. **Yeni Kullanıcıyı Onaylayın**
   - "Onay Bekliyor" durumundaki kullanıcıyı bulun
   - "Onayla" butonuna tıklayın

5. **Doğrulama**
   - ✅ Durum "Onaylı" olmalı
   - ✅ "Onayı Kaldır" butonu görünmeli
   - ✅ Kullanıcı giriş yapabilmeli

---

## Test 4: Güvenlik Kontrolleri

### Test 4.1: Admin Kendini Silemez
1. Admin paneline gidin
2. Admin kullanıcısını bulun
3. ✅ "Sil" butonu OLMAMALI
4. ✅ Sadece "Admin" badge görünmeli

### Test 4.2: Minimum Şifre Uzunluğu
1. Şifre değiştir modalını açın
2. 5 karakterlik şifre girin
3. ✅ "Şifreyi Değiştir" butonu disabled olmalı
4. ✅ Uyarı mesajı görünmeli

### Test 4.3: Boş Şifre
1. Şifre değiştir modalını açın
2. Şifre alanını boş bırakın
3. ✅ "Şifreyi Değiştir" butonu disabled olmalı

---

## 🐛 Hata Senaryoları

### Senaryo 1: Network Hatası
1. Server'ı durdurun
2. Şifre değiştirmeyi deneyin
3. ✅ Hata mesajı görünmeli

### Senaryo 2: Geçersiz Kullanıcı ID
1. Browser console'u açın
2. Manuel API çağrısı yapın (geçersiz ID)
3. ✅ 404 hatası almalı

---

## 📊 Test Sonuçları Tablosu

| Test | Durum | Notlar |
|------|-------|--------|
| Şifre Değiştirme | ⏳ | Test edilecek |
| Kullanıcı Silme | ⏳ | Test edilecek |
| Kullanıcı Onaylama | ⏳ | Test edilecek |
| Admin Koruması | ⏳ | Test edilecek |
| Minimum Şifre | ⏳ | Test edilecek |
| Boş Şifre | ⏳ | Test edilecek |

---

## 🔍 Debug İpuçları

### Browser Console:
```javascript
// Network isteklerini izleyin
// Console > Network sekmesi
```

### Server Logs:
```bash
# Server terminal'inde logları izleyin
# Şifre değişikliği logu:
Admin [admin_id] changed password for user [username] ([email])

# Kullanıcı silme logu:
Admin [admin_id] deleted user [username] ([email])
```

### Database Kontrolü:
```bash
cd server
node check-admin-user.js
```

---

## ✅ Test Tamamlandığında

Tüm testler başarılı olduğunda:
1. ✅ Şifre değiştirme çalışıyor
2. ✅ Kullanıcı silme çalışıyor
3. ✅ Güvenlik kontrolleri aktif
4. ✅ UI responsive ve kullanıcı dostu
5. ✅ Error handling çalışıyor

---

## 🚀 Production Öncesi Kontrol

Production'a deploy etmeden önce:
- [ ] Tüm testler başarılı
- [ ] Güvenlik kontrolleri test edildi
- [ ] Error handling test edildi
- [ ] UI/UX sorunsuz
- [ ] Logs çalışıyor
- [ ] API endpoints test edildi

---

**🎯 Test rehberi hazır! Admin panelini test edebilirsiniz.**