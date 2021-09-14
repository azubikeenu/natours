const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsyc');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // get tour from database
  const tours = await Tour.find();
  // build the template
  //render the template using extracted data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', { title: tour.name, tour });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', { title: 'Log into your account' });
};

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', { title: 'User Accounts Page' });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const { email, name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    {
      new: true, // returns the update user as a result
      runValidators: true, //runs express validators
    }
  );

  res.status(200).render('account', { title: 'User Accounts Page', user });
});
