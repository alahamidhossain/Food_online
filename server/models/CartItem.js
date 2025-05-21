const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  menu_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  special_instructions: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
