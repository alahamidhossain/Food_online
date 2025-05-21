const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { menu_item_id, rating, comment } = req.body;
    
    // Check if menu item exists
    const menuItem = await MenuItem.findById(menu_item_id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    // Check if user has ordered this item before
    const userOrders = await Order.find({ 
      user_id: req.user._id,
      status: 'completed'
    });
    
    if (userOrders.length === 0) {
      return res.status(400).json({ 
        message: 'You can only review items you have ordered' 
      });
    }
    
    const orderIds = userOrders.map(order => order._id);
    
    const hasOrdered = await OrderItem.findOne({
      order_id: { $in: orderIds },
      menu_item_id
    });
    
    if (!hasOrdered) {
      return res.status(400).json({ 
        message: 'You can only review items you have ordered' 
      });
    }
    
    // Check if user has already reviewed this item
    const existingReview = await Review.findOne({
      user_id: req.user._id,
      menu_item_id
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this item' 
      });
    }
    
    // Create review
    const review = await Review.create({
      user_id: req.user._id,
      menu_item_id,
      rating,
      comment
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a menu item
// @route   GET /api/reviews/menu-item/:id
// @access  Public
const getMenuItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ menu_item_id: req.params.id })
      .populate('user_id', 'name')
      .sort('-created_at');
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/myreviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.user._id })
      .populate('menu_item_id', 'name image_url')
      .sort('-created_at');
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });
    
    if (review) {
      review.rating = rating || review.rating;
      review.comment = comment !== undefined ? comment : review.comment;
      
      const updatedReview = await review.save();
      res.json(updatedReview);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });
    
    if (review) {
      await review.deleteOne();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getMenuItemReviews,
  getMyReviews,
  updateReview,
  deleteReview
};
