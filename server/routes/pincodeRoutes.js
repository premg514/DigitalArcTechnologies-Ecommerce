const express = require('express');
const router = express.Router();
const {
    getPincodes,
    getAdminPincodes,
    addPincode,
    updatePincode,
    deletePincode,
    checkPincode,
} = require('../controllers/pincodeController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getPincodes);
router.get('/check/:pincode', checkPincode);

// Admin routes
router.get('/admin', protect, adminOnly, getAdminPincodes);
router.post('/', protect, adminOnly, addPincode);
router.put('/:id', protect, adminOnly, updatePincode);
router.delete('/:id', protect, adminOnly, deletePincode);

module.exports = router;
