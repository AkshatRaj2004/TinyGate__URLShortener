const express = require('express');
const {
  shortenUrl,
  getAllUrls,
  deleteUrl,
  getAnalytics,
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');
const { shortenLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { shortenValidator } = require('../validators/urlValidator');

const router = express.Router();

// All URL routes require authentication
router.use(protect);

// POST /api/url/shorten
router.post('/shorten', shortenLimiter, shortenValidator, validate, shortenUrl);

// GET /api/url/all
router.get('/all', getAllUrls);

// GET /api/url/analytics/:id
router.get('/analytics/:id', getAnalytics);

// DELETE /api/url/:id
router.delete('/:id', deleteUrl);

module.exports = router;
