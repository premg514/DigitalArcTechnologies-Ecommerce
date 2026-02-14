const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  cancelOrderItem,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const {
  validateOrder,
  validateMongoId,
  validateOrderStatus,
} = require('../middleware/validator');

// Create order
router.post('/', protect, validateOrder, createOrder);

// Get user's orders
router.get('/my-orders', protect, getMyOrders);

// Get single order
router.get('/:id', protect, validateMongoId('id'), getOrderById);

// Update order status (Admin)
router.put(
  '/:id/status',
  protect,
  adminOnly,
  validateMongoId('id'),
  validateOrderStatus,
  updateOrderStatus
);

// Cancel order
router.put('/:id/cancel', protect, validateMongoId('id'), cancelOrder);

// Cancel specific order item
router.put('/:id/items/:itemId/cancel', protect, validateMongoId('id'), cancelOrderItem);

module.exports = router;
