const { body } = require('express-validator');

const shortenValidator = [
  body('originalUrl')
    .trim()
    .notEmpty().withMessage('Original URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL including http:// or https://'),

  body('customAlias')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Custom alias must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),

  body('expiresAt')
    .optional()
    .isISO8601().withMessage('Expiry date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
];

module.exports = { shortenValidator };
