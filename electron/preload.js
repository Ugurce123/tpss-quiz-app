const { contextBridge, ipcRenderer } = require('electron');

// Güvenli API'ler sağla
contextBridge.exposeInMainWorld('electronAPI', {
  // Uygulama bilgileri
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Menü olayları
  onMenuNewQuiz: (callback) => {
    ipcRenderer.on('menu-new-quiz', callback);
  },
  
  // Temizlik
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Güvenlik için sadece gerekli olanları expose et
// Node.js API'lerini doğrudan expose etmeyin