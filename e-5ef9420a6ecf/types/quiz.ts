
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  image?: string;
  level: number;
}

export interface QuizResult {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  questionsCount: number;
  passingScore: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  bestScore?: number;
}

export interface UserProgress {
  currentLevel: number;
  unlockedLevels: number[];
  completedLevels: number[];
  totalScore: number;
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  password?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  createdAt: string;
  lastLoginAt?: string;
  status: 'pending' | 'active' | 'blocked';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
