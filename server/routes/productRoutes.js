const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getFeaturedProducts,
  getAdminProducts,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);

// Admin routes (must be before /:id)
router.get('/admin', protect, adminOnly, getAdminProducts);

router.get('/:id', getProductById);

// Protected routes
router.post('/:id/reviews', protect, createProductReview);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;