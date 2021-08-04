const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkRequestBody,
} = require('../controllers/tourController');

const router = express.Router();
router.param('id', checkID);
router.route('/').get(getAllTours).post(checkRequestBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
module.exports = router;
