const express = require('express');
const router = express.Router();
const {
  createReview,
  getMenuItemReviews,
  getMyReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createReview);

router.route('/myreviews')
  .get(protect, getMyReviews);

router.route('/menu-item/:id')
  .get(getMenuItemReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
