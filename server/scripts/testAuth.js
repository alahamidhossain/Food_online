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
      // 1. Get or create customer role
      console.log('Checking for customer role...');
      let customerRole = await Role.findOne({ name: 'customer' });
      
      if (!customerRole) {
        console.log('Creating customer role...');
        customerRole = await Role.create({ name: 'customer' });
        console.log('Customer role created with ID:', customerRole._id);
      } else {
        console.log('Found existing customer role with ID:', customerRole._id);
      }
      
      // 2. Create a test user with a known password
      const testEmail = 'test@example.com';
      const testPassword = 'testpassword';
      
      // Delete any existing test user
      console.log('Removing any existing test user...');
      await User.deleteOne({ email: testEmail });
      
      // Create the test user
      console.log('Creating test user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      const testUser = await User.create({
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        role_id: customerRole._id
      });
      
      console.log('Test user created with ID:', testUser._id);
      console.log('Hashed password:', hashedPassword);
      
      // 3. Test authentication with the created user
      console.log('\nTesting authentication...');
      
      // Find the user by email
      const user = await User.findOne({ email: testEmail });
      
      if (!user) {
        console.log('Error: User not found by email');
        process.exit(1);
      }
      
      console.log('Found user:', user._id);
      console.log('Stored hashed password:', user.password);
      
      // Test password comparison
      console.log('\nTesting password comparison...');
      const isMatch = await user.matchPassword(testPassword);
      console.log('Password match result:', isMatch);
      
      if (isMatch) {
        console.log('\nAUTHENTICATION SUCCESSFUL');
        console.log('You can log in with:');
        console.log('Email:', testEmail);
        console.log('Password:', testPassword);
      } else {
        console.log('\nAUTHENTICATION FAILED');
        console.log('The password comparison function is not working correctly.');
        
        // Try direct bcrypt comparison as a fallback
        console.log('\nTrying direct bcrypt comparison...');
        const directMatch = await bcrypt.compare(testPassword, user.password);
        console.log('Direct bcrypt comparison result:', directMatch);
        
        if (directMatch) {
          console.log('Direct bcrypt comparison works, but the User model method does not.');
        } else {
          console.log('Both methods fail. There might be an issue with how passwords are stored or compared.');
        }
      }
      
      process.exit();
    } catch (error) {
      console.error('Error in test script:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
