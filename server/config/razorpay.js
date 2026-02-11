const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in rupees (will be converted to paise)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Order receipt ID
 * @param {object} notes - Additional notes
 * @returns {Promise<object>} - Razorpay order object
 */
const createOrder = async (amount, currency = 'INR', receipt, notes = {}) => {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
      notes,
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

/**
 * Fetch a Razorpay order by ID
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<object>} - Razorpay order details
 */
const fetchOrder = async (orderId) => {
  try {
    const order = await razorpayInstance.orders.fetch(orderId);
    return order;
  } catch (error) {
    throw new Error(`Failed to fetch Razorpay order: ${error.message}`);
  }
};

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} - Payment details
 */
const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    throw new Error(`Failed to fetch payment details: ${error.message}`);
  }
};

/**
 * Create a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in paise (optional, full refund if not provided)
 * @returns {Promise<object>} - Refund details
 */
const createRefund = async (paymentId, amount = null) => {
  try {
    const options = amount ? { amount } : {};
    const refund = await razorpayInstance.payments.refund(paymentId, options);
    return refund;
  } catch (error) {
    throw new Error(`Refund creation failed: ${error.message}`);
  }
};

module.exports = {
  razorpayInstance,
  createOrder,
  fetchOrder,
  fetchPayment,
  createRefund,
};
