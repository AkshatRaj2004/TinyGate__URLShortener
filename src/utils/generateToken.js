const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for the given user id.
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {string} Signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'tiny-gate',
  });
};

module.exports = generateToken;
