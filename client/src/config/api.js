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

// Vercel'de API path'i /api olmadan başlar
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
const apiPrefix = isVercel ? '' : '/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}${apiPrefix}/auth/login`,
  REGISTER: `${API_BASE_URL}${apiPrefix}/auth/register`,
  
  // Quiz endpoints
  QUIZ_START: (levelId) => `${API_BASE_URL}${apiPrefix}/quiz/start/${levelId}`,
  QUIZ_SUBMIT: `${API_BASE_URL}${apiPrefix}/quiz/submit`,
  QUIZ_STATS: `${API_BASE_URL}${apiPrefix}/quiz/stats`,
  
  // Levels endpoints
  LEVELS: `${API_BASE_URL}${apiPrefix}/levels`,
  
  // Statistics endpoints
  STATS_GENERAL: `${API_BASE_URL}${apiPrefix}/statistics/general`,
  STATS_LEADERBOARD: `${API_BASE_URL}${apiPrefix}/statistics/leaderboard`,
  STATS_USER_PERFORMANCE: `${API_BASE_URL}${apiPrefix}/statistics/user-performance`,
  STATS_LEVELS: `${API_BASE_URL}${apiPrefix}/statistics/levels`,
  
  // Questions endpoints
  QUESTIONS: `${API_BASE_URL}${apiPrefix}/questions`,
  
  // File uploads
  UPLOADS: `${API_BASE_URL}${apiPrefix}/uploads`
};

export default API_BASE_URL;