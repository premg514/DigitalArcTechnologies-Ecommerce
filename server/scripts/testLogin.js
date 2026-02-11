const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const testLogin = async () => {
    try {
        await connectDB();

        const email = 'admin@example.com';
        const password = 'password123';

        console.log(`Testing login for: ${email}`);

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }

        console.log('User found:', user.email);
        console.log('Role:', user.role);
        console.log('Hashed Password:', user.password);

        // Check password
        const isMatch = await user.comparePassword(password);

        if (isMatch) {
            console.log('SUCCESS: Password matches!');
        } else {
            console.log('FAILURE: Password does NOT match!');
        }

        process.exit();
    } catch (error) {
        console.error('Error testing login:', error);
        process.exit(1);
    }
};

testLogin();
