
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, Level } from '@/types/quiz';
import { getAllLevels } from '@/data/questions';

const STORAGE_KEY = 'quiz_progress';

export const useQuizProgress = () => {
  const [progress, setProgress] = useState<UserProgress>({
    currentLevel: 1,
    unlockedLevels: [1],
    completedLevels: [],
    totalScore: 0,
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0
  });
  
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // console.log('useQuizProgress - Initializing data...');
      setLoading(true);
      setError(null);
      
      await Promise.all([
        initializeLevels(),
        loadProgress()
      ]);
    } catch (err) {
      console.log('useQuizProgress - Error initializing data:', err);
      setError('Failed to initialize quiz data');
      setLevels(createFallbackLevels());
    } finally {
      setLoading(false);
    }
  };

  const createFallbackLevels = (): Level[] => {
    const fallbackLevels: Level[] = [];
    for (let i = 1; i <= 10; i++) {
      fallbackLevels.push({
        id: i,
        name: `Seviye ${i}`,
        description: i <= 3 ? 'Kolay' : i <= 7 ? 'Orta' : 'Zor',
        questionsCount: 5,
        passingScore: 70,
        isUnlocked: i === 1,
        isCompleted: false
      });
    }
    return fallbackLevels;
  };

  const initializeLevels = async () => {
    try {
      console.log('useQuizProgress - Initializing levels...');
      const allLevels = getAllLevels();
      setLevels(allLevels);
      console.log(`useQuizProgress - Initialized ${allLevels.length} levels`);
    } catch (error) {
      console.log('useQuizProgress - Error initializing levels:', error);
      setLevels(createFallbackLevels());
    }
  };

  const loadProgress = async () => {
    try {
      console.log('useQuizProgress - Loading progress...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProgress = JSON.parse(stored);
        console.log('useQuizProgress - Progress loaded:', parsedProgress);
        setProgress(parsedProgress);
        updateLevels(parsedProgress);
      } else {
        console.log('useQuizProgress - No stored progress found, using defaults');
        updateLevels(progress);
      }
    } catch (error) {
      console.log('useQuizProgress - Error loading progress:', error);
      updateLevels(progress);
    }
  };

  const saveProgress = async (newProgress: UserProgress) => {
    try {
      console.log('useQuizProgress - Saving progress:', newProgress);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
      updateLevels(newProgress);
      console.log('useQuizProgress - Progress saved successfully');
    } catch (error) {
      console.log('useQuizProgress - Error saving progress:', error);
      setProgress(newProgress);
      updateLevels(newProgress);
    }
  };

  const updateLevels = (userProgress: UserProgress) => {
    try {
      console.log('useQuizProgress - Updating levels with progress:', userProgress);
      setLevels(prevLevels => 
        prevLevels.map(level => ({
          ...level,
          isUnlocked: userProgress.unlockedLevels.includes(level.id),
          isCompleted: userProgress.completedLevels.includes(level.id)
        }))
      );
    } catch (error) {
      console.log('useQuizProgress - Error updating levels:', error);
    }
  };

  const completeLevel = async (levelId: number, score: number) => {
    try {
      console.log('useQuizProgress - Completing level:', levelId, 'with score:', score);
      const newProgress = { ...progress };
      
      newProgress.totalQuizzes += 1;
      newProgress.totalScore += score;
      newProgress.averageScore = Math.round(newProgress.totalScore / newProgress.totalQuizzes);
      newProgress.bestScore = Math.max(newProgress.bestScore, score);
      
      if (score >= 70 && !newProgress.completedLevels.includes(levelId)) {
        newProgress.completedLevels.push(levelId);
        
        const nextLevel = levelId + 1;
        const maxLevel = levels.length > 0 ? levels.length : getAllLevels().length;
        if (nextLevel <= maxLevel && !newProgress.unlockedLevels.includes(nextLevel)) {
          newProgress.unlockedLevels.push(nextLevel);
          newProgress.currentLevel = nextLevel;
        }
      }
      
      await saveProgress(newProgress);
      return newProgress;
    } catch (error) {
      console.log('useQuizProgress - Error completing level:', error);
      throw error;
    }
  };

  const resetProgress = async () => {
    try {
      console.log('useQuizProgress - Resetting progress...');
      const initialProgress: UserProgress = {
        currentLevel: 1,
        unlockedLevels: [1],
        completedLevels: [],
        totalScore: 0,
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0
      };
      
      await saveProgress(initialProgress);
      console.log('useQuizProgress - Progress reset successfully');
    } catch (error) {
      console.log('useQuizProgress - Error resetting progress:', error);
      throw error;
    }
  };

  return {
    progress,
    levels,
    loading,
    error,
    completeLevel,
    resetProgress,
    saveProgress,
    initializeData
  };
};
