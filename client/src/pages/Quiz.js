import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Quiz.css';

const Test = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedDirtyReason, setSelectedDirtyReason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(25);
  const [isQuestionTimedOut, setIsQuestionTimedOut] = useState(false);

  // Kirli seçenekleri için icon mapping
  const dirtyReasonIcons = {
    'explosive_device': '💣',
    'weapon_parts': '🔫',
    'sharp_objects': '🔪',
    'martial_arts_equipment': '🥋',
    'gas_bomb': '💨'
  };

  const fetchTest = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/quiz/start/${levelId}`);
      setTest(response.data);
      setAnswers(new Array(response.data.questions.length).fill(null));
      setStartTime(Date.now());
    } catch (error) {
      console.error('Test yükleme hatası:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [levelId, navigate]);

  const submitTest = useCallback(async (finalAnswers) => {
    setSubmitting(true);
    try {
      const endTime = Date.now();
      const totalTimeSpent = startTime ? Math.round((endTime - startTime) / 1000) : 0;
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/quiz/submit`, {
        levelId,
        answers: finalAnswers,
        timeSpent: totalTimeSpent
      });

      await refreshUser();

      navigate('/results', { 
        state: { 
          results: response.data,
          level: test.level 
        } 
      });
    } catch (error) {
      console.error('Test gönderme hatası:', error);
    } finally {
      setSubmitting(false);
    }
  }, [levelId, startTime, refreshUser, navigate, test]);

  const handleTimeOut = useCallback(() => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: test.questions[currentQuestion]._id,
      answer: null,
      dirtyReason: null
    };
    setAnswers(newAnswers);
    
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setSelectedDirtyReason(null);
      setIsQuestionTimedOut(false);
    } else {
      submitTest(newAnswers);
    }
  }, [answers, currentQuestion, test, submitTest]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  // Timer effect
  useEffect(() => {
    if (startTime && !submitting) {
      const timer = setInterval(() => {
        setTimeSpent(Math.round((Date.now() - startTime) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [startTime, submitting]);

  // Soru timer effect
  useEffect(() => {
    if (test && !submitting) {
      setQuestionTimer(25);
      setIsQuestionTimedOut(false);
      
      const questionTimerInterval = setInterval(() => {
        setQuestionTimer(prev => {
          if (prev <= 1) {
            setIsQuestionTimedOut(true);
            setTimeout(() => {
              handleTimeOut();
            }, 1500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(questionTimerInterval);
    }
  }, [currentQuestion, test, submitting, handleTimeOut]);

  const handleAnswerSelect = (answer) => {
    if (isQuestionTimedOut) return;
    setSelectedAnswer(answer);
    if (answer === 'clean') {
      setSelectedDirtyReason(null);
    }
  };

  const handleDirtyReasonSelect = (reason) => {
    if (isQuestionTimedOut) return;
    setSelectedDirtyReason(reason);
  };

  const handleNext = () => {
    if (!selectedAnswer || (selectedAnswer === 'dirty' && !selectedDirtyReason) || isQuestionTimedOut) {
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: test.questions[currentQuestion]._id,
      answer: selectedAnswer,
      dirtyReason: selectedDirtyReason
    };
    setAnswers(newAnswers);

    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setSelectedDirtyReason(null);
    } else {
      submitTest(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0 && !isQuestionTimedOut) {
      setCurrentQuestion(currentQuestion - 1);
      const prevAnswer = answers[currentQuestion - 1];
      if (prevAnswer) {
        setSelectedAnswer(prevAnswer.answer);
        setSelectedDirtyReason(prevAnswer.dirtyReason);
      } else {
        setSelectedAnswer(null);
        setSelectedDirtyReason(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Test bulunamadı</div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  return (
    <div className={`min-h-screen py-4 sm:py-8 px-4 ${questionTimer <= 10 ? 'screen-warning' : ''}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {test.level.name}
          </h1>
          <div className="flex justify-center items-center gap-4 text-blue-100 text-sm sm:text-base">
            <span>Soru {currentQuestion + 1} / {test.questions.length}</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              ⏱️ {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-20 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="relative">
          {/* Dark Overlay when time is up */}
          {isQuestionTimedOut && (
            <div className="absolute inset-0 bg-black bg-opacity-80 z-10 rounded-2xl flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-4xl mb-4">⏰</div>
                <div className="text-xl font-bold">Süre Doldu!</div>
                <div className="text-sm opacity-75">Sonraki soruya geçiliyor...</div>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className={`glass-effect rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 ${isQuestionTimedOut ? 'opacity-30' : ''}`}
            >
              {/* Image */}
              <div className="mb-4 sm:mb-6 text-center">
                <img
                  src={`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/uploads/${question.image}`}
                  alt="Bagaj"
                  className="w-full max-w-sm sm:max-w-md mx-auto rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Görsel+Yüklenemedi';
                  }}
                />
              </div>

              {/* Horizontal Candle Timer - Mum Çubuğu */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-semibold">
                    {questionTimer <= 10 ? '⚠️ DİKKAT!' : '🕐 Kalan Süre'}
                  </span>
                  <span className="text-white text-lg font-bold">
                    {questionTimer}s
                  </span>
                </div>
                
                <div className="candle-timer-container">
                  <div className={`candle-timer ${questionTimer <= 10 ? 'timer-warning' : ''} ${questionTimer === 0 ? 'timer-expired' : ''}`}>
                    {/* Mum Çubuğu Arka Plan */}
                    <div className="candle-bg"></div>
                    
                    {/* Eriyerek Azalan Kısım */}
                    <div 
                      className="candle-wax"
                      style={{
                        width: `${(questionTimer / 25) * 100}%`
                      }}
                    ></div>
                    
                    {/* Mum Alevi */}
                    <div className="candle-flame" style={{
                      left: `${(questionTimer / 25) * 100}%`
                    }}>
                      🔥
                    </div>
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4 leading-tight">
                  {question.text || question.description || 'Bu bagajı inceleyin ve durumunu belirleyin.'}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect('clean')}
                  className={`p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 ${
                    selectedAnswer === 'clean'
                      ? 'border-green-500 bg-green-500 bg-opacity-20 text-white'
                      : 'border-white border-opacity-30 text-white hover:border-green-500'
                  } ${isQuestionTimedOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">✅</div>
                  <div className="text-lg sm:text-xl font-semibold">Temiz Bagaj</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect('dirty')}
                  className={`p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 ${
                    selectedAnswer === 'dirty'
                      ? 'border-red-500 bg-red-500 bg-opacity-20 text-white'
                      : 'border-white border-opacity-30 text-white hover:border-red-500'
                  } ${isQuestionTimedOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">❌</div>
                  <div className="text-lg sm:text-xl font-semibold">Kirli Bagaj</div>
                </motion.button>
              </div>

              {/* Dirty Reasons */}
              <AnimatePresence>
                {selectedAnswer === 'dirty' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 text-center">
                      Kirlilik sebebini seçin:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {(question?.dirtyOptions || []).map((reason) => (
                        <motion.button
                          key={reason.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDirtyReasonSelect(reason.value)}
                          className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 ${
                            selectedDirtyReason === reason.value
                              ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white'
                              : 'border-white border-opacity-30 text-white hover:border-orange-500'
                          } ${isQuestionTimedOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="text-lg sm:text-xl mb-1 sm:mb-2">{dirtyReasonIcons[reason.value] || '❓'}</div>
                          <div className="font-medium text-sm sm:text-base leading-tight">{reason.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || isQuestionTimedOut}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            ← Önceki
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={
              !selectedAnswer || 
              (selectedAnswer === 'dirty' && !selectedDirtyReason) ||
              submitting ||
              isQuestionTimedOut
            }
            className="px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {submitting ? (
              'Gönderiliyor...'
            ) : currentQuestion === test.questions.length - 1 ? (
              'Bitir'
            ) : (
              'Sonraki →'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Test;