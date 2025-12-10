import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { isDesktopMode } from '../config/desktop';

const Home = () => {
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(isDesktopMode);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold text-white mb-6"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            🧳 Bagaj Testi
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Bagaj kontrolü becerilerinizi test edin! Kirli ve temiz bagajları 
            ayırt etmeyi öğrenin, seviye seviye ilerleyin.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {user ? (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                Ana Sayfaya Git
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Hemen Başla
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Giriş Yap
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="glass-effect rounded-xl p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Seviye Sistemi
            </h3>
            <p className="text-blue-100">
              Başlangıçtan ileri seviyeye kadar kademeli öğrenme
            </p>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Detaylı Analiz
            </h3>
            <p className="text-blue-100">
              Her test sonunda kapsamlı performans raporu
            </p>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              İlerleme Takibi
            </h3>
            <p className="text-blue-100">
              Başarılarınızı takip edin ve yeni seviyeleri açın
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;