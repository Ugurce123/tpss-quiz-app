const fs = require('fs');
const path = require('path');

// API URL'lerini environment variable ile değiştir
const updateApiUrls = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // localhost URL'lerini environment variable ile değiştir
    content = content.replace(/http:\/\/localhost:5001/g, 'process.env.REACT_APP_API_URL || "http://localhost:5001"');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
};

// Güncellenecek dosyalar
const filesToUpdate = [
  'client/src/contexts/AuthContext.js',
  'client/src/pages/Quiz.js',
  'client/src/pages/Dashboard.js',
  'client/src/pages/AdminPanel.js',
  'client/src/pages/Statistics.js'
];

console.log('API URL\'leri güncelleniyor...');
filesToUpdate.forEach(updateApiUrls);
console.log('Tüm dosyalar güncellendi!');