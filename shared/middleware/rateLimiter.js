const rateLimit = require('express-rate-limit');
const config = require('../../core/config');

// Rate limiter for report submissions
exports.rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.maxReportsPerDay,
  message: {
    error: 'Demasiadas solicitudes. Por favor intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP hash or device fingerprint
    return req.ipHash || req.ip;
  }
});

// General API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Demasiadas solicitudes. Por favor intenta más tarde.'
  }
});
