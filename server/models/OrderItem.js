const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
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
  price: {
    type: Number,
    required: true
  },
  special_instructions: {
    type: String,
    default: ''
  }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
