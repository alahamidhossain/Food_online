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
      
      // Find and delete any existing admin user with this email
      console.log('Removing any existing admin user...');
      await User.deleteOne({ email: 'admin@test.com' });
      
      // Create a new admin user with simple credentials
      console.log('Creating new admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role_id: adminRole._id
      });
      
      console.log('Admin user created:');
      console.log({
        name: admin.name,
        email: admin.email,
        role: 'admin'
      });
      console.log('You can now log in with:');
      console.log('Email: admin@test.com');
      console.log('Password: password');
      
      process.exit();
    } catch (error) {
      console.error('Error resetting admin user:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
