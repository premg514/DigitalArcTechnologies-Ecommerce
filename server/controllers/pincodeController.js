const Pincode = require('../models/Pincode');
const { getIO } = require('../config/socket');

// @desc    Get all allowed pincodes
// @route   GET /api/pincodes
// @access  Public
exports.getPincodes = async (req, res) => {
    try {
        const pincodes = await Pincode.find({ isActive: true }).sort('pincode');
        res.status(200).json({
            success: true,
            count: pincodes.length,
            data: pincodes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get admin pincodes (including inactive)
// @route   GET /api/pincodes/admin
// @access  Private/Admin
exports.getAdminPincodes = async (req, res) => {
    try {
        const pincodes = await Pincode.find().sort('pincode');
        res.status(200).json({
            success: true,
            count: pincodes.length,
            data: pincodes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add new allowed pincode
// @route   POST /api/pincodes
// @access  Private/Admin
exports.addPincode = async (req, res) => {
    try {
        const { pincode, city, state } = req.body;

        const existingPincode = await Pincode.findOne({ pincode });
        if (existingPincode) {
            return res.status(400).json({
                success: false,
                message: 'Pincode already exists',
            });
        }

        const newPincode = await Pincode.create({
            pincode,
            city,
            state,
        });

        // Emit socket event
        try {
            const io = getIO();
            io.emit('invalidate_query', ['admin-pincodes']);
            io.emit('invalidate_query', ['pincodes']);
        } catch (error) {
            console.error('Socket emit error:', error);
        }

        res.status(201).json({
            success: true,
            data: newPincode,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update pincode
// @route   PUT /api/pincodes/:id
// @access  Private/Admin
exports.updatePincode = async (req, res) => {
    try {
        const pincode = await Pincode.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!pincode) {
            return res.status(404).json({
                success: false,
                message: 'Pincode not found',
            });
        }

        res.status(200).json({
            success: true,
            data: pincode,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete pincode
// @route   DELETE /api/pincodes/:id
// @access  Private/Admin
exports.deletePincode = async (req, res) => {
    try {
        const pincode = await Pincode.findByIdAndDelete(req.params.id);

        if (!pincode) {
            return res.status(404).json({
                success: false,
                message: 'Pincode not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pincode removed successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Check if pincode is allowed
// @route   GET /api/pincodes/check/:pincode
// @access  Public
exports.checkPincode = async (req, res) => {
    try {
        const pincode = await Pincode.findOne({
            pincode: req.params.pincode,
            isActive: true,
        });

        if (!pincode) {
            return res.status(200).json({
                success: true,
                isAllowed: false,
                message: 'Shipping is not available for this pincode',
            });
        }

        res.status(200).json({
            success: true,
            isAllowed: true,
            data: pincode,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
