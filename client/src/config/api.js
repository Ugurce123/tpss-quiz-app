const API_BASE_URL = process.env.REACT_APP_API_URL || '';

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
  UPLOADS: `${API_BASE_URL}/uploads`
};

export default API_BASE_URL;
