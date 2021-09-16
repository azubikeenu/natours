const express = require('express');

const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
  getMyTours,
} = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingsCheckout } = require('../controllers/bookingsController');

const router = express.Router();

router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

router.post('/submit-user-form', protect, updateUserData);

router.use(isLoggedIn);

router.get('/', createBookingsCheckout, getOverview);

router.get('/tour/:slug', getTour);

router.route('/login').get(getLoginForm);

module.exports = router;
