const express = require('express');

const { protect } = require('../controllers/authController');

const { getCheckoutSession } = require('../controllers/bookingsController');

const router = express.Router();

router.get('/checkout-session/:id', protect, getCheckoutSession);

module.exports = router;
