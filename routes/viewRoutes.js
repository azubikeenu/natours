const express = require('express');

const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
} = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../controllers/authController');

const router = express.Router();

router.get('/me', protect, getAccount);

router.post('/submit-user-form', protect, updateUserData);

router.use(isLoggedIn);

router.get('/', getOverview);

router.get('/tour/:slug', getTour);
router.route('/login').get(getLoginForm);
module.exports = router;
