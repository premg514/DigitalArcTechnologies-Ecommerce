const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const razorpay = require('../config/razorpay');

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { items, shippingPrice = 0, taxPrice = 0 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided'
      });
    }

    // Verify stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // Calculate amount from items
    let itemsTotal = 0;
    items.forEach(item => {
      itemsTotal += item.price * item.quantity;
    });

    const totalAmount = itemsTotal + shippingPrice + taxPrice;
    const amountInPaise = Math.round(totalAmount * 100);

    const options = {
      amount: amountInPaise, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user ? req.user._id.toString() : 'guest',
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        id: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details'
      });
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Fetch payment details from Razorpay API to verify payment status
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);

      // Verify payment status
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        return res.status(400).json({
          success: false,
          message: `Payment not successful. Status: ${payment.status}`,
        });
      }

      // Verify order ID matches
      if (payment.order_id !== razorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: 'Payment order ID mismatch',
        });
      }

      // Update order
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Verify amount matches
      const orderAmountInPaise = Math.round(order.totalPrice * 100);

      if (payment.amount !== orderAmountInPaise) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch',
        });
      }

      order.paymentResult = {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
        paidAt: new Date(),
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
      };
      order.isPaid = true;
      order.paidAt = new Date();
      order.orderStatus = 'processing';

      await order.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: order,
      });
    } catch (apiError) {
      console.error('Razorpay API Error:', apiError);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify payment with Razorpay API',
        error: apiError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Fetch Razorpay order details (including shipping address)
// @route   GET /api/payment/order/:razorpayOrderId
// @access  Public (called after payment)
exports.getRazorpayOrderDetails = async (req, res) => {
  try {
    const { razorpayOrderId } = req.params;

    if (!razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay order ID is required'
      });
    }

    // Fetch order details from Razorpay
    const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);

    console.log('Razorpay Order Details:', JSON.stringify(razorpayOrder, null, 2));

    // Extract shipping address from notes or customer_details
    let shippingAddress = null;

    // Check if address is in notes
    if (razorpayOrder.notes && razorpayOrder.notes.address) {
      try {
        shippingAddress = typeof razorpayOrder.notes.address === 'string'
          ? JSON.parse(razorpayOrder.notes.address)
          : razorpayOrder.notes.address;
      } catch (e) {
        console.error('Failed to parse address from notes:', e);
      }
    }

    // Check customer_details (Razorpay stores shipping info here when collected via checkout)
    if (!shippingAddress && razorpayOrder.customer_details) {
      const customerDetails = razorpayOrder.customer_details;

      // Razorpay stores billing/shipping address in customer_details
      if (customerDetails.shipping_address || customerDetails.billing_address) {
        const addr = customerDetails.shipping_address || customerDetails.billing_address;
        shippingAddress = {
          fullName: customerDetails.name || 'Guest',
          phone: customerDetails.contact || customerDetails.phone || '9999999999',
          street: [addr.line1, addr.line2].filter(Boolean).join(', ') || addr.address || 'Address not provided',
          city: addr.city || 'Unknown',
          state: addr.state || 'Unknown',
          country: addr.country || 'India',
          zipCode: addr.zipcode || addr.postal_code || addr.pincode || '000000',
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        status: razorpayOrder.status,
        shippingAddress,
        customerDetails: razorpayOrder.customer_details,
        notes: razorpayOrder.notes
      }
    });

  } catch (error) {
    console.error('Error fetching Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

