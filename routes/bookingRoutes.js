const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');

const {
  getCheckoutSession,
  getBooking,
  updateBooking,
  createBooking,
  deleteBooking,
  getAllBookings,
} = require('../controllers/bookingsController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/checkout-session/:id', getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').post(createBooking).get(getAllBookings);
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
