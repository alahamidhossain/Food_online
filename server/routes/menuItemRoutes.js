const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuItemController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.route('/')
  .get(getMenuItems)
  .post(protect, admin, createMenuItem);

router.route('/:id')
  .get(getMenuItemById)
  .put(protect, admin, updateMenuItem)
  .delete(protect, admin, deleteMenuItem);

module.exports = router;
