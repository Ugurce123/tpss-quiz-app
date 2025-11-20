import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { FiPlay, FiLock, FiTrendingUp, FiAward, FiClock, FiTarget } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [levels, setLevels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      console.log('Dashboard: Veri yükleniyor...');
      const [levelsResponse, statsResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.LEVELS),
        axios.get(API_ENDPOINTS.QUIZ_STATS)
      ]);

      console.log('Dashboard: Levels response:', levelsResponse.data);
      console.log('Dashboard: Stats response:', statsResponse.data);
      
      setLevels(levelsResponse.data);
      setStats(statsResponse.data);

      // Kullanıcı bilgilerini güncelle
      const updatedUser = {
        ...user,
        currentLevel: statsResponse.data.currentLevel,
        completedLevels: statsResponse.data.completedLevels
      };
      
      if (JSON.stringify(user) !== JSON.stringify(updatedUser)) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Dashboard: Kullanıcı bilgileri güncellendi');
      }
      
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      if (error.response?.status === 403) {
        // Onay bekleyen kullanıcı
        console.log('Dashboard: Kullanıcı onayı bekleniyor');
        setLevels([]);
        setStats({});
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Hoş geldin, {user?.username}! 👋
          </h1>
          <p className="text-lg sm:text-xl text-blue-100">
            Bagaj testi maceranı sürdürmeye hazır mısın?
          </p>
        </motion.div>

        {/* Onay Durumu Kontrolü */}
        {user?.role !== 'admin' && !user?.isApproved && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 sm:px-6 py-4 rounded-lg mb-6 sm:mb-8 text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <FiLock className="mr-2" />
              <h3 className="font-semibold">Hesap Onayı Bekleniyor</h3>
            </div>
            <p>
              Hesabınız henüz admin tarafından onaylanmamış. Testlere erişebilmek için admin onayını beklemeniz gerekmektedir.
            </p>
          </motion.div>
        )}

        {/* İstatistikler */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12"
          >
            <div className="glass-effect rounded-xl p-4 sm:p-6 text-center">
              <FiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Seviye {stats?.currentLevel || 1}
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">Mevcut Seviye</p>
            </div>

            <div className="glass-effect rounded-xl p-4 sm:p-6 text-center">
              <FiAward className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {stats?.completedLevels?.length || 0}
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">Tamamlanan Seviye</p>
            </div>

            <div className="glass-effect rounded-xl p-4 sm:p-6 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                %
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                %{stats?.progress || 0}
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">Genel İlerleme</p>
            </div>

            <div className="glass-effect rounded-xl p-4 sm:p-6 text-center">
              <FiTarget className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {stats?.totalScore || 0}
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">Toplam Puan</p>
            </div>

            <div className="glass-effect rounded-xl p-4 sm:p-6 text-center">
              <FiClock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {stats?.totalTests || 0}
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">Toplam Test</p>
            </div>

            <div className="glass-effect rounded-xl p-4 sm:p-6 text-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xs">
                ✓
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                %{stats?.successRate || 0}
              </h3>
              <p className="text-blue-100 text-sm sm:text-base">Başarı Oranı</p>
            </div>
          </motion.div>
        )}

        {/* Seviyeler */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
            Seviyeler ({levels.length} Seviye)
          </h2>

          {/* Mevcut Seviye Vurgusu */}
          {user && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 mb-6 text-center">
              <h3 className="text-white font-semibold text-lg mb-2">
                Mevcut Seviyeniz: {user.currentLevel}
              </h3>
              <p className="text-indigo-100 text-sm">
                {levels.find(l => l.level === user.currentLevel)?.name || 'Seviye Yükleniyor...'}
              </p>
            </div>
          )}

          {/* Seviye Grupları - 10'ar adet */}
          <div className="levels-navigation">
            <button 
              className="nav-button nav-left"
              onClick={() => {
                const container = document.querySelector('.levels-container');
                container.scrollBy({ left: -400, behavior: 'smooth' });
              }}
            >
              ←
            </button>
            <button 
              className="nav-button nav-right"
              onClick={() => {
                const container = document.querySelector('.levels-container');
                container.scrollBy({ left: 400, behavior: 'smooth' });
              }}
            >
              →
            </button>
          </div>
          <div className="levels-container" id="levels-container">
            {Array.from({ length: Math.ceil(levels.length / 10) }, (_, groupIndex) => {
              const startIndex = groupIndex * 10;
              const endIndex = Math.min(startIndex + 10, levels.length);
              const groupLevels = levels.slice(startIndex, endIndex);
              
              // Grup isimlerini belirle
              const groupNames = [
                '🌱 Temel Gelişim Aşamaları',
                '📈 Orta Düzey Aşamalar', 
                '🎯 İleri Düzey Aşamalar',
                '🏆 Uzman Seviye Aşamalar',
                '👑 Usta Seviye Aşamalar'
              ];
              
              return (
                <div key={groupIndex} className="level-group">
                  <div className="level-group-header">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {groupNames[groupIndex] || `Seviyeler ${startIndex + 1} - ${endIndex}`}
                    </h3>
                    <div className="group-progress-bar">
                      <div 
                        className="group-progress-fill"
                        style={{
                          width: `${(groupLevels.filter(l => 
                            stats?.completedLevels?.some(cl => cl.level === l.level)
                          ).length / groupLevels.length) * 100}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-blue-200 text-sm mt-2">
                      {groupLevels.filter(l => 
                        stats?.completedLevels?.some(cl => cl.level === l.level)
                      ).length} / {groupLevels.length} tamamlandı
                    </p>
                  </div>
                  
                  <div className="level-group-grid">
                    {groupLevels.map((level, levelIndex) => {
                      const isUnlocked = (level?.level || level?.levelNumber || 1) <= (user?.currentLevel || 1);
                      const isCompleted = stats?.completedLevels?.some(
                        cl => cl.level === (level?.level || level?.levelNumber)
                      );
                      const completedLevel = stats?.completedLevels?.find(
                        cl => cl.level === (level?.level || level?.levelNumber)
                      );

                      return (
                        <motion.div
                          key={level._id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * levelIndex }}
                          className={`glass-effect rounded-lg p-4 ${
                            isUnlocked ? 'hover:bg-white hover:bg-opacity-20' : 'opacity-60'
                          } transition-all duration-300`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-white">
                              Seviye {level?.level || levelIndex + 1}
                            </h3>
                            {isCompleted ? (
                              <div className="bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                                ✓
                              </div>
                            ) : isUnlocked ? (
                              <FiPlay className="w-4 h-4 text-blue-400" />
                            ) : (
                              <FiLock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>

                          <h4 className="text-white font-medium mb-2 text-xs leading-tight">
                            {level?.name || 'Seviye'}
                          </h4>

                          <div className="flex items-center justify-between mb-2 text-xs">
                            <span className="text-blue-200">
                              %{level?.passingScore || 70}
                            </span>
                            {completedLevel && (
                              <span className="text-green-300">
                                %{completedLevel?.score || 0}
                              </span>
                            )}
                          </div>

                          {isUnlocked ? (
                            <Link
                              to={`/quiz/${level?._id}`}
                              className="block w-full text-center btn-primary py-1.5 text-xs"
                            >
                              {isCompleted ? 'Tekrar' : 'Başla'}
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-gray-500 text-gray-300 py-1.5 rounded cursor-not-allowed text-xs"
                            >
                              Kilitli
                            </button>
                          )}
                      </motion.div>
                    );
                  })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Son Sonuçlar */}
        {stats?.completedLevels?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Son Sonuçlarınız
            </h2>

            <div className="glass-effect rounded-xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white border-opacity-20">
                      <th className="text-left py-3">Seviye</th>
                      <th className="text-left py-3">Puan</th>
                      <th className="text-left py-3">Durum</th>
                      <th className="text-left py-3">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.completedLevels || [])
                      .slice(-5)
                      .reverse()
                      .map((result, index) => (
                        <tr key={index} className="border-b border-white border-opacity-10">
                          <td className="py-3">Seviye {result.level}</td>
                          <td className="py-3">%{result.score}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              result.score >= 70 
                                ? 'bg-green-500 text-white' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {result.score >= 70 ? 'Geçti' : 'Kaldı'}
                            </span>
                          </td>
                          <td className="py-3">
                            {new Date(result.completedAt).toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;