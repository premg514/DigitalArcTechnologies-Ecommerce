const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllOrders,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const {
  validateMongoId,
  validatePagination,
  validateSearch,
} = require('../middleware/validator');

// All routes are protected and admin only
router.use(protect);
router.use(adminOnly);

// Analytics
router.get('/analytics', getAnalytics);

// Orders
router.get('/orders', validatePagination, getAllOrders);

// Users
router.get('/users', [validatePagination, validateSearch], getAllUsers);
router.put('/users/:id/role', validateMongoId('id'), updateUserRole);
router.delete('/users/:id', validateMongoId('id'), deleteUser);

module.exports = router;