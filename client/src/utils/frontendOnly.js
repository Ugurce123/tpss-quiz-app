// Frontend-Only Mode - Backend olmadan çalışma
import { mockLevels, mockQuestions, mockUsers } from './mockData';

const STORAGE_KEYS = {
  USER: 'baggage_quiz_user',
  TOKEN: 'baggage_quiz_token',
  USERS: 'baggage_quiz_users',
  LEVELS: 'baggage_quiz_levels',
  QUESTIONS: 'baggage_quiz_questions',
  STATS: 'baggage_quiz_stats'
};

// Initialize localStorage
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.LEVELS)) {
    localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(mockLevels));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(mockQuestions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
};

// Auth functions
export const frontendAuth = {
  login: (username, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    const user = Object.values(users).find(u => 
      (u.username === username || u.email === username) && u.password === password
    );
    
    if (user && user.isApproved) {
      const token = 'frontend-token-' + Date.now();
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { success: true, user, token };
    }
    return { success: false, message: 'Giriş başarısız' };
  },
  
  register: (username, email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
    
    if (users[email]) {
      return { success: false, message: 'Kullanıcı zaten mevcut' };
    }
    
    const newUser = {
      username,
      email,
      password,
      role: 'user',
      isApproved: true, // Frontend-only modda otomatik onay
      currentLevel: 1,
      completedLevels: [],
      totalScore: 0,
      createdAt: new Date().toISOString()
    };
    
    users[email] = newUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    const token = 'frontend-token-' + Date.now();
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    
    return { success: true, user: newUser, token };
  },
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  updateUser: (updates) => {
    const user = frontendAuth.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      // Users listesinde de güncelle
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
      users[user.email] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      
      return updatedUser;
    }
    return null;
  }
};

// Level functions
export const frontendLevels = {
  getAll: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEVELS) || '[]');
  },
  
  getById: (levelId) => {
    const levels = frontendLevels.getAll();
    return levels.find(l => l.level === parseInt(levelId));
  }
};

// Question functions
export const frontendQuestions = {
  getByLevel: (levelId) => {
    const questions = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
    return questions.filter(q => q.level === parseInt(levelId));
  }
};

// Quiz functions
export const frontendQuiz = {
  submit: (levelId, answers, timeSpent) => {
    const user = frontendAuth.getCurrentUser();
    if (!user) return { success: false };
    
    const level = frontendLevels.getById(levelId);
    const questions = frontendQuestions.getByLevel(levelId);
    
    let correctCount = 0;
    answers.forEach((answer, index) => {
      const question = questions[index];
      if (question && question.type === answer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= level.passingScore;
    
    if (passed) {
      const completedLevels = user.completedLevels || [];
      if (!completedLevels.find(cl => cl.level === levelId)) {
        completedLevels.push({
          level: levelId,
          score,
          completedAt: new Date().toISOString()
        });
      }
      
      const newLevel = Math.max(user.currentLevel, levelId + 1);
      const newScore = (user.totalScore || 0) + level.rewards.points;
      
      frontendAuth.updateUser({
        currentLevel: newLevel,
        completedLevels,
        totalScore: newScore
      });
    }
    
    return {
      success: true,
      score,
      passed,
      correctCount,
      totalQuestions: questions.length,
      earnedPoints: passed ? level.rewards.points : 0
    };
  }
};

export default {
  auth: frontendAuth,
  levels: frontendLevels,
  questions: frontendQuestions,
  quiz: frontendQuiz,
  initializeStorage
};