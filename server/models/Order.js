const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payment_method: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  items_price: {
    type: Number,
    required: true,
    default: 0.0
  },
  tax_price: {
    type: Number,
    required: true,
    default: 0.0
  },
  delivery_price: {
    type: Number,
    required: true,
    default: 0.0
  },
  discount_amount: {
    type: Number,
    default: 0.0
  },
  total_price: {
    type: Number,
    required: true
  },
  delivery_type: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  shipping_address: {
    type: String
  },
  shipping_city: {
    type: String
  },
  shipping_postal_code: {
    type: String
  },
  shipping_phone: {
    type: String,
    required: true
  },
  coupon_code: {
    type: String
  },
  delivery_eta: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
