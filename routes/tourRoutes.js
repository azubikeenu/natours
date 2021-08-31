const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  bestCheap,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authController');

const reviewRouter = require('./reviewRouter');

const router = express.Router();
// router.param('id', checkID);
router.route('/tour-stat').get(getTourStats);
router.route('/best-cheap').get(bestCheap, getAllTours);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(protect, getAllTours).post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// nested reviews routes
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
