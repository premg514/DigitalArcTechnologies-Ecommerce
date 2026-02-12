const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
} = require('../controllers/userController');

router.use(protect);

router.route('/addresses')
    .get(getAddresses)
    .post(addAddress);

router.route('/addresses/:id')
    .put(updateAddress)
    .delete(deleteAddress);

module.exports = router;
