const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * For production, use services like SendGrid, Mailgun, AWS SES
 */
const createTransporter = () => {
  // Development: Use Ethereal Email (fake SMTP service)
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.EMAIL_PASS || 'ethereal.password',
      },
    });
  }

  // Production: Use real SMTP service
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send email
 * @param {object} options - Email options
 */
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'E-Commerce <noreply@ecommerce.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    // For development with Ethereal
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Email could not be sent');
  }
};

/**
 * Send order confirmation email
 * @param {object} order - Order object
 * @param {object} user - User object
 */
const sendOrderConfirmation = async (order, user) => {
  const orderItems = order.orderItems
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Thank you for your order! Your order has been confirmed.</p>
          
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          
          <table class="order-table">
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems}
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: ₹${order.itemsPrice.toFixed(2)}</p>
            <p>Shipping: ₹${order.shippingPrice.toFixed(2)}</p>
            <p>Tax: ₹${order.taxPrice.toFixed(2)}</p>
            <p style="color: #3B82F6;">Total: ₹${order.totalPrice.toFixed(2)}</p>
          </div>
          
          <h3>Shipping Address</h3>
          <p>
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            Phone: ${order.shippingAddress.phone}
          </p>
          
          <p>We'll send you a shipping confirmation email as soon as your order ships.</p>
          
          <p>Thank you for shopping with us!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: `Order Confirmation - #${order._id}`,
    html,
  });
};

/**
 * Send order shipped email
 * @param {object} order - Order object
 * @param {object} user - User object
 */
const sendOrderShipped = async (order, user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Order Has Shipped!</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Great news! Your order #${order._id} has been shipped.</p>
          
          ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
          
          <p>Your order will arrive within 2-5 business days.</p>
          
          <p>Thank you for your purchase!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: `Your Order Has Shipped - #${order._id}`,
    html,
  });
};

/**
 * Send password reset email
 * @param {object} user - User object
 * @param {string} resetToken - Reset token
 */
const sendPasswordReset = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { 
          display: inline-block;
          padding: 12px 24px;
          background: #3B82F6;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html,
  });
};

/**
 * Send welcome email
 * @param {object} user - User object
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to E-Commerce!</h1>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Welcome to our e-commerce platform! We're excited to have you on board.</p>
          <p>Start exploring our wide range of products and enjoy exclusive deals.</p>
          <p>Happy shopping!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to E-Commerce!',
    html,
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderShipped,
  sendPasswordReset,
  sendWelcomeEmail,
};