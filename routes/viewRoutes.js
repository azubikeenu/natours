const express = require('express');

const {
  getOverview,
  getTour,
  getLoginForm,
} = require('../controllers/viewsController');

const router = express.Router();

router.get('/', getOverview);

router.get('/tour/:slug', getTour);
router.route('/login').get(getLoginForm);

module.exports = router;
