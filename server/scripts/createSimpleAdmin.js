const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Role = require('../models/Role');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Check if admin role exists, create if not
      let adminRole = await Role.findOne({ name: 'admin' });
      
      if (!adminRole) {
        console.log('Creating admin role...');
        adminRole = await Role.create({ name: 'admin' });
        console.log('Admin role created');
      }
      
      // Delete any existing admin user
      console.log('Removing any existing admin user...');
      await User.deleteOne({ email: 'admin@admin.com' });
      
      // Create a simple admin user without pre-hashing the password
      // The User model will hash it automatically
      console.log('Creating new admin user...');
      
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'admin123',
        role_id: adminRole._id
      });
      
      console.log('Admin user created:');
      console.log({
        name: admin.name,
        email: admin.email,
        role: 'admin'
      });
      console.log('You can now log in with:');
      console.log('Email: admin@admin.com');
      console.log('Password: admin123');
      
      process.exit();
    } catch (error) {
      console.error('Error creating admin user:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
