const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getUsers 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

module.exports = router;
