const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const createAdminUser = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@example.com';
        const adminPassword = 'password123';

        // Check if admin exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists');
            console.log(`Email: ${adminEmail}`);
            // We can't show the password because it's hashed
            // But we can update it if needed
            // adminExists.password = adminPassword;
            // await adminExists.save();
            // console.log(`Password reset to: ${adminPassword}`);
        } else {
            const user = await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
                isVerified: true
            });

            console.log('Admin user created successfully');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
        }

        process.exit();
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
