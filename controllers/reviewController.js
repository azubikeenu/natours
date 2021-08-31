const catchAsyc = require('../utils/catchAsyc');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsyc(async (req, res, next) => {
  const filter = req.params.tourId ? { tour: req.params.tourId } : {};
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'Success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsyc(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      review,
    },
  });
});

exports.deleteReview = factory.deleteOne(Review, 'No review with that id');
