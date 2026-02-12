const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items',
      });
    }

    // Verify stock availability
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
        });
      }
    }

    const orderData = {
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    // If payment result is provided, verify and mark as paid
    if (req.body.paymentResult && paymentMethod === 'razorpay') {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body.paymentResult;

      const crypto = require('crypto');
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpaySignature) {
        orderData.isPaid = true;
        orderData.paidAt = Date.now();
        orderData.paymentResult = {
          id: razorpayPaymentId,
          status: 'completed',
          update_time: Date.now(),
          email_address: req.user.email,
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature
        };
        orderData.orderStatus = 'processing';
        orderData.timeline = [{
          status: 'Placed',
          comment: 'Order placed successfully',
          timestamp: Date.now()
        }, {
          status: 'Processing',
          comment: 'Payment confirmed, order is processing',
          timestamp: Date.now()
        }];
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }
    } else {
      // Default timeline for other methods (e.g. COD if enabled later)
      orderData.timeline = [{
        status: 'Placed',
        comment: 'Order placed successfully',
        timestamp: Date.now()
      }];
    }

    const order = await Order.create(orderData);

    // Reduce stock quantity
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is authorized to view this order
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, currentLocation } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = status;
    order.timeline.push({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      comment: `Order status updated to ${status}`,
      timestamp: Date.now()
    });

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    if (status === 'cancelled') {
      order.cancelledAt = new Date();

      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (currentLocation) {
      order.currentLocation = currentLocation;
      order.timeline.push({ // Track location updates too
        status: 'Location Update',
        comment: `Arrived at ${currentLocation}`,
        timestamp: Date.now()
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const razorpay = require('../config/razorpay');

// @desc    Request return
// @route   PUT /api/orders/:id/return
// @access  Private
exports.requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order must be delivered to request a return',
      });
    }

    if (order.returnRequest && order.returnRequest.status !== 'none') {
      return res.status(400).json({
        success: false,
        message: 'Return already requested',
      });
    }

    order.returnRequest = {
      reason,
      status: 'pending',
      requestedAt: Date.now(),
    };

    order.orderStatus = 'return_requested';
    order.timeline.push({
      status: 'Return Requested',
      comment: `Reason: ${reason}`,
      timestamp: Date.now()
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update return status (Admin)
// @route   PUT /api/orders/:id/return-status
// @access  Private/Admin
exports.updateReturnStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body; // status: 'approved' or 'rejected'
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status === 'approved') {
      // Initiate Refund Logic
      if (order.isPaid && order.paymentMethod === 'razorpay') {
        try {
          const paymentId = order.paymentResult.razorpayPaymentId;
          const refund = await razorpay.payments.refund(paymentId, {
            "speed": "normal",
            "notes": {
              "reason": "Return Request Approved"
            }
          });

          order.paymentResult.refundId = refund.id;
          order.paymentResult.refundStatus = refund.status;
          order.paymentResult.refundAmount = refund.amount;
          order.paymentResult.refundedAt = Date.now();
        } catch (err) {
          console.error("Refund failed", err);
          return res.status(500).json({ success: false, message: 'Refund failed' });
        }
      }
      order.orderStatus = 'returned';
      order.timeline.push({
        status: 'Return Approved',
        comment: adminComment || 'Return approved and refund initiated.',
        timestamp: Date.now()
      });
    } else if (status === 'rejected') {
      order.orderStatus = 'delivered'; // Revert to delivered or keep as is? Maybe specific status?
      // Let's keep it delivered but mark return as rejected
      order.timeline.push({
        status: 'Return Rejected',
        comment: adminComment || 'Return request rejected.',
        timestamp: Date.now()
      });
    }

    order.returnRequest.status = status;
    order.returnRequest.resolvedAt = Date.now();
    order.returnRequest.adminComment = adminComment;

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Only allow cancellation if order is pending or processing
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
    }

    // Handle Refund if order is paid via Razorpay
    if (order.isPaid && order.paymentMethod === 'razorpay') {
      try {
        const paymentId = order.paymentResult.razorpayPaymentId;

        // Initiate refund via Razorpay
        const refund = await razorpay.payments.refund(paymentId, {
          "speed": "normal",
          "notes": {
            "reason": "Customer requested cancellation"
          }
        });

        // Store refund details in order (optional but recommended)
        order.paymentResult = {
          ...order.paymentResult,
          refundId: refund.id,
          refundStatus: refund.status,
          refundAmount: refund.amount,
          refundedAt: new Date()
        };

        console.log(`Refund initiated for Order ${order._id}:`, refund);

      } catch (refundError) {
        console.error('Razorpay Refund Error:', refundError);
        return res.status(500).json({
          success: false,
          message: 'Failed to process refund. Please contact support.',
          error: refundError.message
        });
      }
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.timeline.push({
      status: 'Cancelled',
      comment: 'Order cancelled by user',
      timestamp: Date.now()
    });

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: order.isPaid ? 'Order cancelled and refund initiated successfully' : 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};