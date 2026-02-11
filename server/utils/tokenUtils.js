const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} - JWT token
 */
const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate password reset token
 * @param {string} userId - User ID
 * @returns {string} - Reset token
 */
const generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'reset' },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
};

/**
 * Generate email verification token
 * @param {string} userId - User ID
 * @returns {string} - Verification token
 */
const generateVerificationToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'verify' },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
    }
  );
};

module.exports = {
  generateToken,
  verifyToken,
  generateResetToken,
  generateVerificationToken,
};