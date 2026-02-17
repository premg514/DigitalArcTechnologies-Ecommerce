const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayOrderDetails,
} = require('../controllers/paymentController');
const { protect, optionalProtect } = require('../middleware/auth');

router.post('/create-order', optionalProtect, createRazorpayOrder);
router.post('/verify', optionalProtect, verifyPayment);
router.get('/order/:razorpayOrderId', getRazorpayOrderDetails);

module.exports = router;