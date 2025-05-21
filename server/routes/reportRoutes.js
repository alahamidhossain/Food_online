const express = require('express');
const router = express.Router();
const { generateReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes
router.route('/').get(protect, admin, generateReport);

module.exports = router;
