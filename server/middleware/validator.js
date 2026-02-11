const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * User Registration Validation
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  validate,
];

/**
 * User Login Validation
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate,
];

/**
 * Product Validation
 */
const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food', 'Other'])
    .withMessage('Invalid category'),

  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),

  validate,
];

/**
 * Order Validation
 */
const validateOrder = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),

  body('orderItems.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('orderItems.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('shippingAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .matches(/^[0-9]{6}$/)
    .withMessage('Invalid Indian zip code'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+91|0)?[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number'),

  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['razorpay', 'cod'])
    .withMessage('Invalid payment method'),

  body('totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),

  validate,
];

/**
 * Review Validation
 */
const validateReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters'),

  validate,
];

/**
 * MongoDB ID Validation
 */
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage('Invalid ID format'),

  validate,
];

/**
 * Pagination Query Validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  validate,
];

/**
 * Order Status Update Validation
 */
const validateOrderStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),

  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Invalid tracking number'),

  body('currentLocation')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty if provided'),

  validate,
];

/**
 * Email Validation
 */
const validateEmail = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  validate,
];

/**
 * Password Validation
 */
const validatePassword = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  validate,
];

/**
 * Search Query Validation
 */
const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),

  validate,
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder,
  validateReview,
  validateMongoId,
  validatePagination,
  validateOrderStatus,
  validateEmail,
  validatePassword,
  validateSearch,
};