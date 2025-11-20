# MongoDB Atlas Kurulum Adımları

## 1. Atlas Hesabı Oluşturma
1. https://www.mongodb.com/atlas adresine gidin
2. "Try Free" butonuna tıklayın
3. Email ile kayıt olun

## 2. Cluster Oluşturma
1. "Build a Database" seçin
2. "M0 Sandbox" (FREE) seçin
3. Provider: AWS, Region: Frankfurt (eu-central-1) seçin
4. Cluster Name: baggage-quiz-cluster

## 3. Database User Oluşturma
1. Security > Database Access
2. "Add New Database User"
3. Username: baggage-admin
4. Password: (güçlü bir şifre oluşturun)
5. Database User Privileges: "Read and write to any database"

## 4. Network Access
1. Security > Network Access
2. "Add IP Address"
3. "Allow Access from Anywhere" (0.0.0.0/0)

## 5. Connection String
1. Database > Connect
2. "Connect your application"
3. Driver: Node.js
4. Connection string'i kopyalayın