const Order = require('../models/Order');
const Product = require('../models/Product');
const { getIO } = require('../config/socket');
const { sendOrderConfirmation } = require('../utils/emailService');
const razorpay = require('../config/razorpay');

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

    let userId = req.user?._id;
    let currentUser = req.user;

    if (!userId && shippingAddress?.phone) {
      // Try to find a user with this phone number
      const User = require('../models/User');
      const userByPhone = await User.findOne({ phone: shippingAddress.phone });
      if (userByPhone) {
        userId = userByPhone._id;
        currentUser = userByPhone;
      }
    }

    const orderData = {
      user: userId,
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
        // Fetch payment details to get shipping address if missing
        let fetchedShippingAddress = shippingAddress;
        let paymentEmail = currentUser?.email || 'Guest';
        let paymentPhone = shippingAddress?.phone || currentUser?.phone;

        try {
          const payment = await razorpay.payments.fetch(razorpayPaymentId);
          console.log('Razorpay Payment Details:', JSON.stringify(payment, null, 2));
          paymentEmail = payment.email || paymentEmail;
          paymentPhone = payment.contact || paymentPhone;

          const getAddressFromObject = (obj) => {
            if (!obj) return null;
            // Check for direct shipping_address object
            if (obj.shipping_address) return obj.shipping_address;
            // Check for stringified shipping_address in notes
            if (obj.notes?.shipping_address) {
              try {
                return typeof obj.notes.shipping_address === 'string'
                  ? JSON.parse(obj.notes.shipping_address)
                  : obj.notes.shipping_address;
              } catch (e) {
                console.error('Failed to parse shipping_address from notes:', e);
              }
            }
            // Check for flat fields in notes
            if (obj.notes?.address || obj.notes?.city) {
              return {
                name: obj.notes.name || 'Guest',
                line1: obj.notes.address || obj.notes.line1,
                line2: obj.notes.line2 || '',
                city: obj.notes.city,
                state: obj.notes.state,
                postal_code: obj.notes.zipCode || obj.notes.pincode || obj.notes.zip,
                country: obj.notes.country || 'India',
                phone: obj.notes.phone || obj.contact
              };
            }
            return null;
          };

          if (!fetchedShippingAddress) {
            let rzpAddress = getAddressFromObject(payment);

            // If not in payment, check the order
            if (!rzpAddress && razorpayOrderId) {
              try {
                const order = await razorpay.orders.fetch(razorpayOrderId);
                console.log('Razorpay Order Details:', JSON.stringify(order, null, 2));
                rzpAddress = getAddressFromObject(order);
              } catch (orderError) {
                console.error('Error fetching Razorpay order details:', orderError);
              }
            }

            if (rzpAddress) {
              fetchedShippingAddress = {
                fullName: rzpAddress.name || rzpAddress.full_name || payment.notes?.name || 'Guest',
                address: rzpAddress.line1 || rzpAddress.address || (rzpAddress.line1 + (rzpAddress.line2 ? `, ${rzpAddress.line2}` : '')),
                city: rzpAddress.city,
                state: rzpAddress.state,
                zipCode: rzpAddress.postal_code || rzpAddress.zip || rzpAddress.pincode,
                country: rzpAddress.country || 'India',
                phone: rzpAddress.phone || payment.contact,
              };
            }
          }
        } catch (fetchError) {
          console.error('Error fetching Razorpay payment details:', fetchError);
        }

        if (!orderData.user && paymentPhone) {
          try {
            const User = require('../models/User');
            const userByPhone = await User.findOne({ phone: paymentPhone });
            if (userByPhone) {
              orderData.user = userByPhone._id;
            }
          } catch (userError) {
            console.error('Error finding user by phone after RMC fetch:', userError);
          }
        }

        if (!fetchedShippingAddress) {
          return res.status(400).json({
            success: false,
            message: 'Shipping address is required. Please ensure address is provided in Razorpay Magic Checkout.'
          });
        }

        orderData.shippingAddress = fetchedShippingAddress;
        orderData.isPaid = true;
        orderData.paidAt = Date.now();
        orderData.paymentResult = {
          id: razorpayPaymentId,
          status: 'completed',
          update_time: Date.now(),
          email_address: paymentEmail,
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
      // For non-razorpay or razorpay without result yet
      if (!shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Shipping address is required'
        });
      }

      // Default timeline for other methods (e.g. COD if enabled later)
      orderData.timeline = [{
        status: 'Placed',
        comment: 'Order placed successfully',
        timestamp: Date.now()
      }];
    }

    const order = await Order.create(orderData);

    // Send order confirmation email if user and email exist
    if (currentUser && currentUser.email) {
      sendOrderConfirmation(order, currentUser).catch((err) =>
        console.error('Order confirmation email failed:', err)
      );
    }

    // Reduce stock quantity
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Emit socket event
    try {
      const io = getIO();
      io.emit('invalidate_query', ['admin-orders']);
      io.emit('invalidate_query', ['orders', 'my-orders']); // Fixed
      io.emit('invalidate_query', ['products']); // Stock levels changed
    } catch (error) {
      console.error('Socket emit error:', error);
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
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
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

    // Check if order items are individual cancellable
    const updatedOrderItems = [];
    let isAnyItemCancellable = false;

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      const isItemCancellable = product ? product.isCancellable : true;
      if (isItemCancellable && !item.isCancelled) isAnyItemCancellable = true;

      updatedOrderItems.push({
        ...item._doc,
        isCancellable: isItemCancellable
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...order._doc,
        orderItems: updatedOrderItems,
        isCancellable: isAnyItemCancellable // At least one item can be cancelled
      },
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

    // Only add status timeline entry if status has changed
    const statusChanged = order.orderStatus !== status;

    if (statusChanged) {
      order.orderStatus = status;
      order.timeline.push({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        comment: `Order status updated to ${status}`,
        timestamp: Date.now()
      });
    }

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

    // Emit socket event
    try {
      const io = getIO();
      io.emit('invalidate_query', ['admin-orders']);
      io.emit('invalidate_query', ['orders', 'my-orders']); // Fixed to match client key
      io.emit('invalidate_query', ['admin-order', req.params.id]);
      io.emit('invalidate_query', ['order', req.params.id]); // Added for customer order details
    } catch (error) {
      console.error('Socket emit error:', error);
    }

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



// @desc    Cancel specific order item
// @route   PUT /api/orders/:id/items/:itemId/cancel
// @access  Private
exports.cancelOrderItem = async (req, res) => {
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
        message: 'Not authorized to cancel this item',
      });
    }

    // Only allow cancellation if order is pending or processing
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Item cannot be cancelled at this stage',
      });
    }

    const item = order.orderItems.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in order',
      });
    }

    if (item.isCancelled) {
      return res.status(400).json({
        success: false,
        message: 'Item is already cancelled',
      });
    }

    // Check if product is cancellable
    const product = await Product.findById(item.product);
    if (product && !product.isCancellable) {
      return res.status(400).json({
        success: false,
        message: `This item (${item.name}) is non-cancellable`,
      });
    }

    // Handle Refund for this specific item if order is paid
    if (order.isPaid && order.paymentMethod === 'razorpay') {
      try {
        const paymentId = order.paymentResult.razorpayPaymentId;

        // Calculate refund amount for this item
        // Simple formula: item price * quantity
        // Ensure it's an integer for Razorpay (paise)
        const refundAmount = Math.round(item.price * item.quantity * 100);

        console.log(`Initiating partial refund for Item ${item.name} (${item._id}): ${refundAmount} paise`);

        // Initiate refund via Razorpay
        const refund = await razorpay.payments.refund(paymentId, {
          "amount": refundAmount,
          "speed": "normal",
          "notes": {
            "reason": `Cancellation of ${item.name.substring(0, 100)}`,
            "orderId": order._id.toString(),
            "itemId": item._id.toString()
          }
        });

        // Store refund details in order
        order.timeline.push({
          status: 'Refund Initiated',
          comment: `Refund of ${item.price * item.quantity} initiated for ${item.name}. Refund ID: ${refund.id}`,
          timestamp: Date.now()
        });

      } catch (refundError) {
        console.error('Razorpay Partial Refund Error:', {
          message: refundError.message,
          description: refundError.description,
          code: refundError.code,
          metadata: refundError.metadata
        });
        return res.status(500).json({
          success: false,
          message: 'Failed to process refund for this item. Please contact support.',
          error: refundError.description || refundError.message
        });
      }
    }

    // Mark as cancelled
    item.isCancelled = true;
    item.cancelledAt = new Date();

    // Restore stock
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });

    order.timeline.push({
      status: 'Item Cancelled',
      comment: `Item ${item.name} cancelled by user`,
      timestamp: Date.now()
    });

    // Check if all items are now cancelled
    const allItemsCancelled = order.orderItems.every(i => i.isCancelled);
    if (allItemsCancelled) {
      order.orderStatus = 'cancelled';
      order.cancelledAt = new Date();
      order.timeline.push({
        status: 'Cancelled',
        comment: 'Full order cancelled as all items were cancelled',
        timestamp: Date.now()
      });
    }

    await order.save();

    // Emit socket event
    try {
      const io = getIO();
      io.emit('invalidate_query', ['admin-orders']);
      io.emit('invalidate_query', ['orders', 'my-orders']);
      io.emit('invalidate_query', ['admin-order', req.params.id]);
      io.emit('invalidate_query', ['order', req.params.id]);
      io.emit('invalidate_query', ['products']);
    } catch (error) {
      console.error('Socket emit error:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Item cancelled successfully',
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

// @desc    Cancel order (Modified to support item-wise cancellation logic)
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

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
    }

    // Identify which items can be cancelled
    const cancellableItems = [];
    for (const item of order.orderItems) {
      if (item.isCancelled) continue;

      const product = await Product.findById(item.product);
      if (product && product.isCancellable) {
        cancellableItems.push(item);
      }
    }

    if (cancellableItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No cancellable items found in this order',
      });
    }

    // Proceed to cancel all cancellable items
    let totalRefund = 0;
    for (const item of cancellableItems) {
      item.isCancelled = true;
      item.cancelledAt = new Date();
      totalRefund += (item.price * item.quantity);

      // Restore stock
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    // Handle Refund if paid
    if (order.isPaid && order.paymentMethod === 'razorpay' && totalRefund > 0) {
      try {
        const paymentId = order.paymentResult.razorpayPaymentId;
        const refundAmountPaise = Math.round(totalRefund * 100);

        console.log(`Initiating bulk refund for Order ${order._id}: ${refundAmountPaise} paise`);

        await razorpay.payments.refund(paymentId, {
          "amount": refundAmountPaise,
          "speed": "normal",
          "notes": {
            "reason": "Customer cancelled all eligible items",
            "orderId": order._id.toString()
          }
        });
      } catch (refundError) {
        console.error('Razorpay Bulk Refund Error:', {
          message: refundError.message,
          description: refundError.description,
          code: refundError.code
        });
        // We continue anyway since items are marked cancelled in DB
        // But maybe we should add a timeline entry about the failed refund?
        order.timeline.push({
          status: 'Refund Failed',
          comment: `Automatic refund failed: ${refundError.description || refundError.message}. Please contact support for manual refund.`,
          timestamp: Date.now()
        });
      }
    }

    // Check if whole order is now cancelled
    const allItemsCancelled = order.orderItems.every(i => i.isCancelled);
    if (allItemsCancelled) {
      order.orderStatus = 'cancelled';
      order.cancelledAt = new Date();
    }

    order.timeline.push({
      status: 'Bulk Cancellation',
      comment: `Cancelled ${cancellableItems.length} items from order`,
      timestamp: Date.now()
    });

    await order.save();

    // Emit socket event
    try {
      const io = getIO();
      io.emit('invalidate_query', ['admin-orders']);
      io.emit('invalidate_query', ['orders', 'my-orders']);
      io.emit('invalidate_query', ['admin-order', req.params.id]);
      io.emit('invalidate_query', ['order', req.params.id]);
      io.emit('invalidate_query', ['products']);
    } catch (error) {
      console.error('Socket emit error:', error);
    }

    res.status(200).json({
      success: true,
      message: allItemsCancelled ? 'Order cancelled successfully' : 'Eligible items cancelled successfully',
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