// Frontend güvenlik yardımcı fonksiyonları

// XSS koruması - HTML encode
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Script tags
    .replace(/javascript:/gi, '') // JavaScript protocols
    .replace(/on\w+\s*=/gi, '') // Event handlers
    .replace(/data:text\/html/gi, '') // Data URLs
    .slice(0, 1000); // Length limit
};

// Token güvenliği
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // JWT format kontrolü
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Payload decode
    const payload = JSON.parse(atob(parts[1]));
    
    // Expiry kontrolü
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Güvenli localStorage işlemleri
export const secureStorage = {
  set: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  
  get: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

// API request güvenliği
export const secureApiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  // Token kontrolü
  if (token && !isTokenValid(token)) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    // Unauthorized durumunda logout
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }
    
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Form validation
export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, value] of Object.entries(data)) {
    const rule = rules[field];
    if (!rule) continue;
    
    // Required kontrolü
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} gereklidir`;
      continue;
    }
    
    // Min length kontrolü
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} en az ${rule.minLength} karakter olmalıdır`;
      continue;
    }
    
    // Max length kontrolü
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${field} en fazla ${rule.maxLength} karakter olmalıdır`;
      continue;
    }
    
    // Email kontrolü
    if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field] = 'Geçerli bir email adresi giriniz';
      continue;
    }
    
    // Password kontrolü
    if (rule.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      errors[field] = 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir';
      continue;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// CSRF token (eğer gerekirse)
export const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : null;
};

// Content Security Policy helper
export const addCSPMeta = () => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://server-eight-alpha-56.vercel.app https://*.netlify.app;";
  document.head.appendChild(meta);
};

// Session timeout handler
export const setupSessionTimeout = (timeoutMinutes = 30) => {
  let timeoutId;
  
  const resetTimeout = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      alert('Oturum süreniz doldu. Yeniden giriş yapmanız gerekiyor.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }, timeoutMinutes * 60 * 1000);
  };
  
  // User activity listeners
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetTimeout, true);
  });
  
  resetTimeout();
};