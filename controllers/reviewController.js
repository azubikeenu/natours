const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsyc');
const Bookings = require('../models/bookingsModel');
const AppError = require('../utils/appError');

exports.getAllReviews = factory.getAll(Review);

//middleware to set tour and user id on create tour
exports.setTourAndUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.checkIfBooked = catchAsync(async (req, res, next) => {
  const { tour, user } = req.body;
  const bookings = await Bookings.find({ tour, user });
  if (bookings.length === 0) {
    return next(
      new AppError('You can only review tours that you have purchased', 404)
    );
  }
  next();
});

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review, 'No review found with id');
exports.deleteReview = factory.deleteOne(Review, 'No review with that id');
exports.getReview = factory.getOne(Review);
