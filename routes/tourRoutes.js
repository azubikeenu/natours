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

const { protect } = require('../controllers/authController');

const router = express.Router();
// router.param('id', checkID);
router.route('/tour-stat').get(getTourStats);
router.route('/best-cheap').get(bestCheap, getAllTours);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(protect, getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
module.exports = router;
