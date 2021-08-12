const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  bestCheap,
} = require('../controllers/tourController');

const router = express.Router();
// router.param('id', checkID);
router.route('/best-cheap').get(bestCheap, getAllTours);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
module.exports = router;
