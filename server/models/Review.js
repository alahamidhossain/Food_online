const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
