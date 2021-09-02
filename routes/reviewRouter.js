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

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourAndUserId, createReview);

router
  .route('/:id')
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .get(getReview);

module.exports = router;
