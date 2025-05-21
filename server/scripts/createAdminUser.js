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
      
      // Check if customer role exists, create if not
      let customerRole = await Role.findOne({ name: 'customer' });
      
      if (!customerRole) {
        console.log('Creating customer role...');
        customerRole = await Role.create({ name: 'customer' });
        console.log('Customer role created');
      }
      
      // Find the admin user if it exists
      const adminUser = await User.findOne({ email: 'ahamidontheway@gmail.com' });
      
      if (adminUser) {
        console.log('Updating admin user password...');
        // Update the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        adminUser.password = hashedPassword;
        await adminUser.save();
        
        console.log('Admin user password updated:');
        console.log({
          name: adminUser.name,
          email: adminUser.email,
          role: 'admin'
        });
        console.log('You can now log in with:');
        console.log('Email: ahamidontheway@gmail.com');
        console.log('Password: admin123');
      } else {
        // Create admin user
        console.log('Creating new admin user...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const admin = await User.create({
          name: 'Admin User',
          email: 'ahamidontheway@gmail.com',
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
        console.log('Email: ahamidontheway@gmail.com');
        console.log('Password: admin123');
      }
      
      process.exit();
    } catch (error) {
      console.error('Error creating/updating admin user:', error.message);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });
