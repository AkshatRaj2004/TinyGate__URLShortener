const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/authValidator');

const router = express.Router();

// POST /api/auth/register
router.post('/register', authLimiter, registerValidator, validate, register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidator, validate, login);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
