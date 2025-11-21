const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  
  // Quiz endpoints
  QUIZ_START: (levelId) => `${API_BASE_URL}/quiz/start/${levelId}`,
  QUIZ_SUBMIT: `${API_BASE_URL}/quiz/submit`,
  QUIZ_STATS: `${API_BASE_URL}/quiz/stats`,
  
  // Levels endpoints
  LEVELS: `${API_BASE_URL}/levels`,
  
  // Statistics endpoints
  STATS_GENERAL: `${API_BASE_URL}/statistics/general`,
  STATS_LEADERBOARD: `${API_BASE_URL}/statistics/leaderboard`,
  STATS_USER_PERFORMANCE: `${API_BASE_URL}/statistics/user-performance`,
  STATS_LEVELS: `${API_BASE_URL}/statistics/levels`,
  
  // Questions endpoints
  QUESTIONS: `${API_BASE_URL}/questions`,
  
  // File uploads
  UPLOADS: `${API_BASE_URL.replace('/api', '')}/uploads`
};

export default API_BASE_URL;
