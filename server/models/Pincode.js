const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema(
    {
        pincode: {
            type: String,
            required: [true, 'Please provide a pincode'],
            unique: true,
            trim: true,
            minlength: [6, 'Pincode must be 6 digits'],
            maxlength: [6, 'Pincode must be 6 digits'],
        },
        city: {
            type: String,
            required: [true, 'Please provide city name'],
            trim: true,
        },
        state: {
            type: String,
            required: [true, 'Please provide state name'],
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster searching
// Index for faster searching - Removed duplicate
// pincodeSchema.index({ pincode: 1 });

module.exports = mongoose.model('Pincode', pincodeSchema);
