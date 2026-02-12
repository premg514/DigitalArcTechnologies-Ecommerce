const User = require('../models/User');

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // If this is the first address, make it default
        if (user.addresses.length === 0) {
            req.body.isDefault = true;
        }

        // If new address is set as default, unset previous default
        if (req.body.isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.addresses.push(req.body);
        await user.save();

        res.status(201).json({
            success: true,
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === req.params.id
        );

        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // If updating to default, unset other defaults
        if (req.body.isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            ...req.body
        };

        await user.save();

        res.status(200).json({
            success: true,
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.id
        );

        await user.save();

        res.status(200).json({
            success: true,
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
