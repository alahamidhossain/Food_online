const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discount_percent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  valid_from: {
    type: Date,
    required: true
  },
  valid_until: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
