const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * For production, use services like SendGrid, Mailgun, AWS SES
 */
/**
 * Get email transporter
 */
const getTransporter = async () => {
  // Use SMTP credentials if provided in .env
  if (process.env.SMTP_USER && process.env.SMTP_PASS &&
    process.env.SMTP_USER !== 'your_email@gmail.com' &&
    process.env.SMTP_PASS !== 'your_app_password') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal for Development
  if (process.env.NODE_ENV === 'development') {
    // Try to create a test account automatically for zero-config development
    try {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error('Failed to create Ethereal test account, using placeholders:', err);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.password',
        },
      });
    }
  }

  // Default fallback for Production (should have SMTP credentials)
  return nodemailer.createTransport({
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
  try {
    const transporter = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'E-Commerce <noreply@ecommerce.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log based on whether we are in test mode or real mode
    const isEthereal = info.envelope && (info.messageId && info.messageId.includes('ethereal')) || (transporter.options.host && transporter.options.host.includes('ethereal'));

    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('\n--------------------------------------------------');
      console.log('⚠️  EMAIL SENT TO TEST INBOX (NOT REAL EMAIL)');
      console.log('Mode: TEST MODE (Ethereal)');
      console.log('Reason: Placeholder credentials detected in .env');
      if (previewUrl) {
        console.log('View Email Here: ', previewUrl);
      }
      console.log('--------------------------------------------------\n');
    } else {
      console.log('✅ REAL EMAIL SENT SUCCESSFULLY:', info.messageId);
      console.log('To:', options.to);
    }

    return info;
  } catch (error) {
    console.error('\n❌ EMAIL SERVICE ERROR:');
    console.error(error.message);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

const getEmailHeader = (title, color = '#7A1F1F') => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #3D1F1F; margin: 0; padding: 0; background-color: #FFF8F0; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(122, 31, 31, 0.1); border: 1px solid #E8DCC8; }
      .header { background: ${color}; color: white; padding: 40px 20px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px; }
      .brand { font-size: 14px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px; opacity: 0.9; }
      .content { padding: 40px 30px; }
      .footer { padding: 30px; background: #F5E6D3; text-align: center; font-size: 13px; color: #8B6B4F; border-top: 1px solid #E8DCC8; }
      .button { display: inline-block; padding: 14px 30px; background: #C85A3C; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: background 0.3s; }
      .order-table { width: 100%; border-collapse: collapse; margin: 25px 0; background: #ffffff; }
      .order-table th { background: #FAF3E8; padding: 12px; text-align: left; font-size: 13px; text-transform: uppercase; color: #7A1F1F; border-bottom: 2px solid #E8DCC8; }
      .order-table td { padding: 15px 12px; border-bottom: 1px solid #F5E6D3; font-size: 14px; }
      .total-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #7A1F1F; text-align: right; }
      .total-row { font-size: 15px; margin-bottom: 5px; color: #6B4423; }
      .grand-total { font-size: 20px; font-weight: bold; color: #7A1F1F; margin-top: 10px; }
      .address-card { background: #FAF3E8; padding: 20px; border-radius: 8px; border: 1px solid #E8DCC8; margin-top: 25px; }
      .thank-you { font-size: 18px; color: #7A1F1F; font-weight: 600; margin-top: 30px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand">Amrutha Pure & Natural</div>
        <h1>${title}</h1>
      </div>
      <div class="content">
`;

const getEmailFooter = () => `
      <div class="thank-you">Thank you for being a part of the Amrutha family!</div>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Amrutha Pure & Natural. All rights reserved.</p>
        <p>Providing the finest organic and natural essentials for your home.</p>
      </div>
    </div>
  </body>
  </html>
`;

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
          <td style="font-weight: 500;">${item.name}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right; font-weight: 600;">₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>`
    )
    .join('');

  const html = `
    ${getEmailHeader('Order Confirmed')}
      <p style="font-size: 16px;">Dear <strong>${user.name}</strong>,</p>
      <p>Thank you for your order! We're excited to let you know that we've received your request and are preparing it with care.</p>
      
      <div style="margin-top: 30px;">
        <h3 style="color: #7A1F1F; border-bottom: 1px solid #E8DCC8; padding-bottom: 10px; margin-bottom: 15px;">Order Summary</h3>
        <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id}</p>
        <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      
      <table class="order-table">
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems}
        </tbody>
      </table>
      
      <div class="total-section">
        <div class="total-row">Subtotal: ₹${order.itemsPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div class="total-row">Shipping: ₹${order.shippingPrice === 0 ? 'FREE' : order.shippingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div class="total-row">Tax: ₹${order.taxPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div class="grand-total">Total Amount: ₹${order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
      </div>
      
      <div class="address-card">
        <h4 style="margin: 0 0 10px 0; color: #7A1F1F; font-size: 14px; text-transform: uppercase;">Delivery To:</h4>
        <p style="margin: 0; line-height: 1.4;">
          <strong>${order.shippingAddress.fullName}</strong><br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
          <span style="color: #8B6B4F; font-size: 13px;">Phone: ${order.shippingAddress.phone}</span>
        </p>
      </div>
    ${getEmailFooter()}
  `;

  await sendEmail({
    to: user.email,
    subject: `Thank You for Your Order! - Amrutha Rice (#${order._id.toString().slice(-6).toUpperCase()})`,
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
    ${getEmailHeader('On Its Way!', '#C85A3C')}
      <p style="font-size: 16px;">Dear <strong>${user.name}</strong>,</p>
      <p>Great news! Your order <strong>#${order._id}</strong> has been shipped and is now making its way to you.</p>
      
      <div style="background: #FAF3E8; border: 1px dashed #C85A3C; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h4 style="margin: 0 0 10px 0; color: #C85A3C;">Tracking Number</h4>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #3D1F1F;">${order.trackingNumber || 'Pending'}</div>
        <p style="margin: 15px 0 0 0; font-size: 14px; color: #8B6B4F;">You can use this number to track your package on our website.</p>
      </div>
      
      <p>Your package should arrive within 2-5 business days. We hope you enjoy your Amrutha Pure & Natural products!</p>
    ${getEmailFooter()}
  `;

  await sendEmail({
    to: user.email,
    subject: `Your Amrutha Order has Shipped! (#${order._id.toString().slice(-6).toUpperCase()})`,
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
    ${getEmailHeader('Password Reset')}
      <p style="font-size: 16px;">Dear <strong>${user.name}</strong>,</p>
      <p>We received a request to reset your password for your Amrutha account. If you didn't make this request, you can safely ignore this email.</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <p style="margin-bottom: 25px; color: #8B6B4F;">Click the button below to securely reset your password:</p>
        <a href="${resetUrl}" class="button">Reset My Password</a>
      </div>
      
      <p style="font-size: 13px; color: #A89078; padding: 20px; border-top: 1px solid #E8DCC8;">
        This link is valid for 1 hour. For security reasons, do not share this link with anyone.
      </p>
    ${getEmailFooter()}
  `;

  await sendEmail({
    to: user.email,
    subject: 'Amrutha - Password Reset Request',
    html,
  });
};

/**
 * Send welcome email
 * @param {object} user - User object
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    ${getEmailHeader('Welcome to the family!')}
      <p style="font-size: 18px; color: #7A1F1F; text-align: center;">Warm Greetings from Amrutha!</p>
      <p style="font-size: 16px;">Dear <strong>${user.name}</strong>,</p>
      <p>We're absolutely delighted to welcome you to <strong>Amrutha Pure & Natural</strong>. You've joined a community that values purity, health, and the finest natural products for a better lifestyle.</p>
      
      <div style="background: #FAF3E8; padding: 25px; border-radius: 8px; margin: 30px 0; border: 1px solid #E8DCC8;">
        <h4 style="margin: 0 0 10px 0; color: #7A1F1F;">What to expect:</h4>
        <ul style="padding-left: 20px; margin: 0; color: #6B4423;">
          <li>Hand-picked organic essentials</li>
          <li>Exclusive member-only seasonal deals</li>
          <li>Early access to new product launches</li>
          <li>Nutritional tips and wellness guides</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL}/products" class="button">Start Your Journey</a>
      </div>
    ${getEmailFooter()}
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Amrutha Pure & Natural!',
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