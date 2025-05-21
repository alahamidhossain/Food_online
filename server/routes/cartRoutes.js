const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);

router.route('/sync')
  .post(protect, syncCart);

router.route('/:id')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

module.exports = router;
