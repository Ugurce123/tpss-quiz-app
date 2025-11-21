const rateLimit = require('express-rate-limit');

// Güvenlik başlıkları middleware'i
const securityHeaders = (req, res, next) => {
  // XSS koruması
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content type sniffing koruması
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Clickjacking koruması
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (sadece HTTPS için)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    error: 'Çok fazla API isteği. Lütfen daha sonra tekrar deneyin.',
    retryAfter: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 || 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip;
  },
  skip: (req) => {
    // Health check endpoint'lerini atla
    return req.path === '/health' || req.path === '/status';
  }
});

// Auth endpoint'leri için özel rate limiting
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: {
    error: 'Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.',
    retryAfter: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 || 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.ip + ':auth';
  }
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 5, // Dakikada maksimum 5 upload
  message: {
    error: 'Çok fazla dosya yükleme isteği. Lütfen bekleyin.',
    retryAfter: 60
  }
});

// Suspicious activity detection
const suspiciousActivityDetector = (req, res, next) => {
  const suspiciousPatterns = [
    /(\<script\>|\<\/script\>)/gi,
    /(javascript:|vbscript:|onload=|onerror=)/gi,
    /(union.*select|select.*from|insert.*into|delete.*from|drop.*table)/gi,
    /(\.\./){3,}/gi, // Path traversal
    /(cmd|exec|system|eval|base64)/gi
  ];

  const checkSuspicious = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  // URL, headers ve body'yi kontrol et
  const suspicious = 
    checkSuspicious(req.url) ||
    checkSuspicious(req.get('User-Agent')) ||
    checkSuspicious(JSON.stringify(req.body)) ||
    checkSuspicious(JSON.stringify(req.query));

  if (suspicious) {
    console.warn(`Suspicious activity detected from ${req.ip}: ${req.method} ${req.url}`);
    console.warn(`User-Agent: ${req.get('User-Agent')}`);
    console.warn(`Body: ${JSON.stringify(req.body)}`);
    
    return res.status(400).json({
      error: 'Geçersiz istek tespit edildi',
      code: 'SUSPICIOUS_ACTIVITY'
    });
  }

  next();
};

// IP whitelist/blacklist
const ipFilter = (req, res, next) => {
  const clientIP = req.ip;
  
  // Blacklisted IP'ler (örnek)
  const blacklistedIPs = [
    // '192.168.1.100', // Örnek blacklisted IP
  ];
  
  if (blacklistedIPs.includes(clientIP)) {
    console.warn(`Blocked request from blacklisted IP: ${clientIP}`);
    return res.status(403).json({
      error: 'Erişim engellendi',
      code: 'IP_BLOCKED'
    });
  }
  
  next();
};

module.exports = {
  securityHeaders,
  apiLimiter,
  authLimiter,
  uploadLimiter,
  suspiciousActivityDetector,
  ipFilter
};