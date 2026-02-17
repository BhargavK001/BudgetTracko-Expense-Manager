/**
 * Admin Seed Script
 * 
 * Creates an admin user and updates existing users with new fields.
 * Run: node scripts/seedAdmin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');

const ADMIN_DATA = {
    displayName: 'Admin',
    email: 'admin@budgettracko.app',
    password: 'Sunita10041977@',
    role: 'admin',
    registrationMethod: 'normal',
    accountStatus: 'active',
};

async function seedAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully.\n');

        // 1. Create or update admin user
        console.log('--- Creating Admin User ---');
        const existingAdmin = await User.findOne({ email: ADMIN_DATA.email });

        if (existingAdmin) {
            console.log(`Admin user already exists: ${ADMIN_DATA.email}`);
            console.log('Updating role to admin...');
            existingAdmin.role = 'admin';
            existingAdmin.accountStatus = 'active';
            await existingAdmin.save();
            console.log('Admin user updated successfully.');
        } else {
            const admin = new User(ADMIN_DATA);
            await admin.save();
            console.log(`Admin user created: ${ADMIN_DATA.email}`);
        }

        // 2. Update existing users without the new fields
        console.log('\n--- Updating Existing Users ---');

        // Set role = 'user' for users who don't have it (excluding admin)
        const roleResult = await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'user' } }
        );
        console.log(`Users updated with role field: ${roleResult.modifiedCount}`);

        // Set registrationMethod = 'normal' for users who don't have it
        const regResult = await User.updateMany(
            { registrationMethod: { $exists: false } },
            { $set: { registrationMethod: 'normal' } }
        );
        console.log(`Users updated with registrationMethod: ${regResult.modifiedCount}`);

        // Fix registrationMethod for users who registered via OAuth
        const googleResult = await User.updateMany(
            { googleId: { $exists: true, $ne: null }, registrationMethod: 'normal' },
            { $set: { registrationMethod: 'google' } }
        );
        console.log(`Google users corrected: ${googleResult.modifiedCount}`);

        const githubResult = await User.updateMany(
            { githubId: { $exists: true, $ne: null }, registrationMethod: 'normal' },
            { $set: { registrationMethod: 'github' } }
        );
        console.log(`GitHub users corrected: ${githubResult.modifiedCount}`);

        // Set accountStatus = 'active' for users who don't have it
        const statusResult = await User.updateMany(
            { accountStatus: { $exists: false } },
            { $set: { accountStatus: 'active' } }
        );
        console.log(`Users updated with accountStatus: ${statusResult.modifiedCount}`);

        // Summary
        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const userCount = await User.countDocuments({ role: 'user' });

        console.log('\n--- Summary ---');
        console.log(`Total users: ${totalUsers}`);
        console.log(`Admins: ${adminCount}`);
        console.log(`Regular users: ${userCount}`);
        console.log('\nDone! Admin can login at /admin/login');

    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    }
}

seedAdmin();
