const rateLimit = require('express-rate-limit');

/**
 * Applied to every incoming request.
 * 200 requests per IP per 15 minutes.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Stricter limiter for auth endpoints.
 * 10 attempts per IP per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * Limiter for URL creation.
 * 50 requests per IP per hour.
 */
const shortenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'URL creation limit reached. Please try again after an hour.',
  },
});

module.exports = { globalLimiter, authLimiter, shortenLimiter };
