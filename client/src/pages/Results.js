import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiHome, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const { results, level } = location.state || {};

  useEffect(() => {
    // Sonuç sayfası yüklendiğinde kullanıcı bilgilerini güncelle
    refreshUser();
  }, [refreshUser]);

  if (!results || !level) {
    navigate('/dashboard');
    return null;
  }

  const dirtyReasonLabels = {
    explosive_device: 'Patlayıcı Madde Düzeneği (Bomba)',
    weapon_parts: 'Silah / Silah Parçası / Mermi / Fişek',
    sharp_objects: 'Kesici/Delici Alet',
    martial_arts_equipment: 'Dövüş Sanatları Ekipmanı',
    gas_bomb: 'EL / GAZ / SİS Bombası'
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreMessage = (score, passed) => {
    if (passed) {
      if (score >= 90) return 'Mükemmel! 🎉';
      if (score >= 80) return 'Harika! 👏';
      return 'Başarılı! ✅';
    }
    return 'Tekrar dene! 💪';
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-4"
          >
            {results.passed ? '🎉' : '😔'}
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Test Tamamlandı!
          </h1>
          <p className="text-xl text-blue-100">
            {level.name} - {getScoreMessage(results.score, results.passed)}
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-8 mb-8 text-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(results.score)}`}>
                %{results.score}
              </div>
              <div className="text-blue-100">Puanınız</div>
            </div>
            
            <div>
              <div className="text-4xl font-bold text-white mb-2">
                {results.correctAnswers}/{results.totalQuestions}
              </div>
              <div className="text-blue-100">Doğru Cevap</div>
            </div>
            
            <div>
              <div className={`text-4xl font-bold mb-2 ${
                results.passed ? 'text-green-400' : 'text-red-400'
              }`}>
                {results.passed ? '✅' : '❌'}
              </div>
              <div className="text-blue-100">
                {results.passed ? 'Geçti' : 'Kaldı'}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <p className="text-blue-100">
              Geçme puanı: %{results.passingScore}
            </p>
            {results.nextLevelUnlocked && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-green-300 mt-2 font-semibold"
              >
                🎊 Yeni seviye açıldı!
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Detaylı Sonuçlar
          </h2>

          <div className="space-y-4">
            {results.results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-4 rounded-xl border-2 ${
                  result.isCorrect
                    ? 'border-green-500 bg-green-500 bg-opacity-10'
                    : 'border-red-500 bg-red-500 bg-opacity-10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {result.isCorrect ? (
                      <FiCheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <FiXCircle className="w-6 h-6 text-red-400" />
                    )}
                    <span className="text-white font-medium">
                      Soru {index + 1}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white text-sm">
                      <strong>Cevabınız:</strong> {
                        result.userAnswer.answer === 'clean' ? 'Temiz' : 'Kirli'
                      }
                      {result.userAnswer.dirtyReason && (
                        <span className="text-blue-200">
                          {' '}({dirtyReasonLabels[result.userAnswer.dirtyReason]})
                        </span>
                      )}
                    </div>
                    
                    {!result.isCorrect && (
                      <div className="text-green-300 text-sm mt-1">
                        <strong>Doğru cevap:</strong> {
                          result.correctAnswer.answer === 'clean' ? 'Temiz' : 'Kirli'
                        }
                        {result.correctAnswer.dirtyReason && (
                          <span>
                            {' '}({dirtyReasonLabels[result.correctAnswer.dirtyReason]})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/dashboard"
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <FiHome className="w-5 h-5" />
            <span>Ana Sayfaya Dön</span>
          </Link>

          <Link
            to={`/quiz/${level._id}`}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>Tekrar Dene</span>
          </Link>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-blue-100 text-lg">
            {results.passed
              ? 'Tebrikler! Bir sonraki seviyeye geçmeye hazırsın. 🚀'
              : 'Pes etme! Pratik yaparak daha iyi olacaksın. 💪'
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;