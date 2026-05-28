const express = require('express');
const { redirectToOriginal } = require('../controllers/urlController');

const router = express.Router();

// GET /:shortCode  — must be mounted last in app.js
router.get('/:shortCode', redirectToOriginal);

module.exports = router;
