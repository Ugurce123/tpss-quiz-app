const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Geçersiz veri formatı',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Auth validation rules
const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Kullanıcı adı 3-30 karakter arası olmalıdır')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Kullanıcı adı sadece harf, rakam ve _ içerebilir')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email adresi çok uzun'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Şifre 6-128 karakter arası olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Şifre gereklidir')
    .trim(),
  
  handleValidationErrors
];

// Quiz validation rules
const validateQuizSubmission = [
  body('levelId')
    .isMongoId()
    .withMessage('Geçersiz seviye ID'),
  
  body('answers')
    .isArray({ min: 1 })
    .withMessage('En az bir cevap gereklidir'),
  
  body('answers.*.questionId')
    .optional()
    .isMongoId()
    .withMessage('Geçersiz soru ID'),
  
  body('answers.*.answer')
    .optional()
    .isIn(['clean', 'dirty', null])
    .withMessage('Cevap clean, dirty veya null olmalıdır'),
  
  body('timeSpent')
    .optional()
    .isInt({ min: 0, max: 7200 })
    .withMessage('Geçersiz süre değeri'),
  
  handleValidationErrors
];

// Question validation rules
const validateQuestion = [
  body('text')
    .isLength({ min: 10, max: 500 })
    .withMessage('Soru metni 10-500 karakter arası olmalıdır')
    .trim()
    .escape(),
  
  body('correctAnswer')
    .isIn(['clean', 'dirty'])
    .withMessage('Doğru cevap clean veya dirty olmalıdır'),
  
  body('level')
    .isInt({ min: 1, max: 50 })
    .withMessage('Seviye 1-50 arası olmalıdır'),
  
  body('points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Puan 1-100 arası olmalıdır'),
  
  handleValidationErrors
];

// Level validation rules
const validateLevel = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('Seviye adı 3-100 karakter arası olmalıdır')
    .trim()
    .escape(),
  
  body('level')
    .isInt({ min: 1, max: 50 })
    .withMessage('Seviye numarası 1-50 arası olmalıdır'),
  
  body('passingScore')
    .isInt({ min: 1, max: 100 })
    .withMessage('Geçme puanı 1-100 arası olmalıdır'),
  
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Süre limiti 1-120 dakika arası olmalıdır'),
  
  handleValidationErrors
];

// Sanitization helpers
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // XSS koruması
      .replace(/javascript:/gi, '') // JavaScript injection koruması
      .replace(/on\w+\s*=/gi, ''); // Event handler koruması
  }
  return input;
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      sanitized[key] = value.map(sanitizeInput);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = sanitizeInput(value);
    }
  }
  return sanitized;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateQuizSubmission,
  validateQuestion,
  validateLevel,
  handleValidationErrors,
  sanitizeInput,
  sanitizeObject
};