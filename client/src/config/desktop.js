// Desktop uygulaması için API konfigürasyonu
const isElectron = window.electronAPI !== undefined;

const DESKTOP_API_URL = 'http://localhost:5001';
const WEB_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const API_BASE_URL = isElectron ? DESKTOP_API_URL : WEB_API_URL;

// Electron API'leri varsa kullan
export const electronAPI = window.electronAPI;

// Desktop modunda mıyız?
export const isDesktopMode = isElectron;

// Uygulama bilgilerini al
export const getAppInfo = async () => {
  if (isElectron && window.electronAPI) {
    try {
      const version = await window.electronAPI.getAppVersion();
      const platform = await window.electronAPI.getPlatform();
      return {
        version,
        platform,
        isDesktop: true
      };
    } catch (error) {
      console.error('Electron API hatası:', error);
      return {
        version: '1.0.0',
        platform: 'web',
        isDesktop: false
      };
    }
  }
  return {
    version: '1.0.0',
    platform: 'web',
    isDesktop: false
  };
};