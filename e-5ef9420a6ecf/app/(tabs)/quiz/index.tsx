
import React, { useState, useEffect } from "react";
import { useTheme } from "@react-navigation/native";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform, Alert } from "react-native";
import { Stack } from "expo-router";
import * as Haptics from 'expo-haptics';

import { getQuestionsByLevel } from "@/data/questions";
import AnswerOptions from "@/components/AnswerOptions";
import { Question, QuizResult, Level } from "@/types/quiz";
import { colors, commonStyles, buttonStyles } from "@/styles/commonStyles";
import ExplanationModal from "@/components/ExplanationModal";
import LevelSelector from "@/components/LevelSelector";
import { IconSymbol } from "@/components/IconSymbol";
import QuestionCard from "@/components/QuestionCard";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import QuizSummaryModal from "@/components/QuizSummaryModal";

export default function QuizScreen() {
  const { progress, levels, completeLevel, loading, error } = useQuizProgress();
  const theme = useTheme();
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false); // artık kullanılmıyor (anlık doğru/yanlış kaldırıldı)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const startQuiz = (level: Level) => {
    // console.log('QuizScreen - Starting quiz for level:', level.id);
    
    try {
      const levelQuestions = getQuestionsByLevel(level.id);
      // console.log('QuizScreen - Loaded questions:', levelQuestions.length);
      
      if (levelQuestions.length === 0) {
        Alert.alert('Hata', 'Bu seviye için soru bulunamadı.');
        return;
      }

      setQuestions(levelQuestions);
      setCurrentLevel(level);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setQuizResults([]);
      setTimeLeft(30);
      setTimerActive(true);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      // console.log('QuizScreen - Error starting quiz:', error);
      Alert.alert('Hata', 'Sınav başlatılırken bir hata oluştu.');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    // console.log('QuizScreen - Answer selected:', answerIndex);
    setSelectedAnswer(answerIndex);
    setTimerActive(false);
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      console.log('QuizScreen - No current question available');
      return;
    }
    
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    // Record the result
    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeSpent: 30 - timeLeft
    };
    
    setQuizResults(prev => [...prev, result]);
    
    // Anlık doğru/yanlış gösterme yerine otomatik ilerle
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        handleNextQuestion();
      } else {
        handleQuizComplete();
      }
    }, 600);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(isCorrect ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleNextQuestion = () => {
    console.log('QuizScreen - Moving to next question');
    setShowExplanation(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(prev => prev + 1);
    setTimeLeft(30);
    setTimerActive(true);
  };

  const handleExplanationClose = () => {
    // Artık kullanılmıyor
  };

  const handleQuizComplete = async () => {
    console.log('QuizScreen - Completing quiz...');
    setTimerActive(false);
    
    if (!currentLevel || quizResults.length === 0) {
      console.log('QuizScreen - No level or results to process');
      return;
    }

    const correctAnswers = quizResults.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    // console.log('QuizScreen - Quiz completed:', { correctAnswers, totalQuestions: questions.length, score });
    
    try {
      await completeLevel(currentLevel.id, score);
      setShowSummary(true);
    } catch (error) {
      // console.log('QuizScreen - Error completing level:', error);
      Alert.alert('Hata', 'Sonuçlar kaydedilirken bir hata oluştu.');
    }
  };

  const restartQuiz = () => {
    if (currentLevel) {
      startQuiz(currentLevel);
    }
  };

  const getScorePercentage = () => {
    if (quizResults.length === 0) return 0;
    const correct = quizResults.filter(r => r.isCorrect).length;
    return Math.round((correct / quizResults.length) * 100);
  };

  const renderHeaderRight = () => (
    <View style={styles.headerRight}>
      {quizStarted && (
        <>
          <View style={styles.timerContainer}>
            <IconSymbol name="clock" color={timeLeft <= 10 ? colors.error : colors.primary} size={16} />
            <Text style={[styles.timerText, timeLeft <= 10 && { color: colors.error }]}>
              {timeLeft}s
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1}/{questions.length}
            </Text>
          </View>
        </>
      )}
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: "TPSS Hazırlık Sınavı",
            headerRight: renderHeaderRight
          }} 
        />
        <View style={[commonStyles.container, { justifyContent: 'center' }]}>
          <Text style={commonStyles.title}>Yükleniyor...</Text>
          <Text style={commonStyles.textSecondary}>TPSS Hazırlık Sınavı verileri hazırlanıyor</Text>
        </View>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: "TPSS Hazırlık Sınavı",
            headerRight: renderHeaderRight
          }} 
        />
        <View style={[commonStyles.container, { justifyContent: 'center' }]}>
          <Text style={[commonStyles.title, { color: colors.error }]}>Hata</Text>
          <Text style={commonStyles.textSecondary}>{error}</Text>
          <Pressable 
            style={[buttonStyles.primary, { marginTop: 20 }]}
            onPress={() => window.location.reload()}
          >
            <Text style={buttonStyles.primaryText}>Yeniden Dene</Text>
          </Pressable>
        </View>
      </>
    );
  }

  if (!quizStarted) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: "TPSS Hazırlık Sınavı",
            headerRight: renderHeaderRight
          }} 
        />
        <ScrollView style={commonStyles.wrapper} contentContainerStyle={styles.container}>
          <View style={commonStyles.content}>
            <Text style={commonStyles.title}>TPSS Hazırlık Sınavı Seviyeleri</Text>
            <Text style={commonStyles.textSecondary}>
              Bir seviye seçin ve bilginizi test edin!
            </Text>
            
            {levels.length > 0 ? (
              <LevelSelector
                levels={levels.filter(l => l.isUnlocked)}
                onLevelSelect={startQuiz}
              />
            ) : (
              <View style={styles.noLevelsContainer}>
                <Text style={styles.noLevelsText}>Seviyeler yükleniyor...</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: "Quiz",
            headerRight: renderHeaderRight
          }} 
        />
        <View style={[commonStyles.container, { justifyContent: 'center' }]}>
          <Text style={commonStyles.title}>Soru yükleniyor...</Text>
          <Pressable 
            style={[buttonStyles.secondary, { marginTop: 20 }]}
            onPress={() => setQuizStarted(false)}
          >
            <Text style={[buttonStyles.secondaryText, { color: colors.primary }]}>
              Ana Menüye Dön
            </Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Seviye ${currentLevel?.id}`,
          headerRight: renderHeaderRight
        }} 
      />
      
      <ScrollView style={commonStyles.wrapper} contentContainerStyle={styles.quizContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>

        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />

        <AnswerOptions
          options={currentQuestion.options || []}
          selectedAnswer={selectedAnswer}
          showResult={false}
          onAnswerSelect={handleAnswerSelect}
          disabled={selectedAnswer !== null}
        />

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Mevcut Skor: %{getScorePercentage()}
          </Text>
        </View>
      </ScrollView>
      {/* Anlık açıklama modalı kaldırıldı; özet sınav sonunda gösterilecek */}
      <QuizSummaryModal
        visible={showSummary}
        questions={questions}
        results={quizResults}
        score={getScorePercentage()}
        onRetry={restartQuiz}
        onClose={() => { setShowSummary(false); setQuizStarted(false); }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  quizContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100, // Extra space for floating tab bar
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  progressContainer: {
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  noLevelsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noLevelsText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
