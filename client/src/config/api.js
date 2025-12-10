// API Configuration
import { isDesktopMode } from './desktop.js';

let API_BASE_URL;

if (isDesktopMode) {
  API_BASE_URL = 'http://localhost:5001';
} else if (process.env.REACT_APP_API_URL) {
  API_BASE_URL = process.env.REACT_APP_API_URL;
} else if (typeof window !== 'undefined') {
  // Vercel'de API aynı domain'de
  API_BASE_URL = window.location.origin;
} else {
  API_BASE_URL = '';
}

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  
  // Quiz endpoints
  QUIZ_START: (levelId) => `${API_BASE_URL}/api/quiz/start/${levelId}`,
  QUIZ_SUBMIT: `${API_BASE_URL}/api/quiz/submit`,
  QUIZ_STATS: `${API_BASE_URL}/api/quiz/stats`,
  
  // Levels endpoints
  LEVELS: `${API_BASE_URL}/api/levels`,
  
  // Statistics endpoints
  STATS_GENERAL: `${API_BASE_URL}/api/statistics/general`,
  STATS_LEADERBOARD: `${API_BASE_URL}/api/statistics/leaderboard`,
  STATS_USER_PERFORMANCE: `${API_BASE_URL}/api/statistics/user-performance`,
  STATS_LEVELS: `${API_BASE_URL}/api/statistics/levels`,
  
  // Questions endpoints
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  
  // File uploads
  UPLOADS: `${API_BASE_URL}/api/uploads`
};

export default API_BASE_URL;