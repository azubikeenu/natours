const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');

const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourAndUserId,
  getReview,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourAndUserId, createReview);

router.route('/:id').delete(deleteReview).patch(updateReview).get(getReview);

module.exports = router;
