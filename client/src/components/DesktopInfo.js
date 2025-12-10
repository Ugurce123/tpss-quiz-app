import React, { useState, useEffect } from 'react';
import { getAppInfo } from '../config/desktop';

const DesktopInfo = () => {
  const [appInfo, setAppInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppInfo = async () => {
      try {
        const info = await getAppInfo();
        setAppInfo(info);
      } catch (error) {
        console.error('Uygulama bilgileri alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppInfo();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-800">Uygulama bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!appInfo?.isDesktop) {
    return null; // Web modunda gösterme
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-1">
            💻 Masaüstü Uygulaması
          </h3>
          <p className="text-blue-700 text-sm">
            Versiyon {appInfo.version} • {appInfo.platform}
          </p>
        </div>
        <div className="text-blue-600">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.12.27a.75.75 0 01-1.38-.6L14.5 13H9.5l-.12.27a.75.75 0 01-1.38-.6L8.22 13H6a2 2 0 01-2-2V5zm2.5.5a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DesktopInfo;