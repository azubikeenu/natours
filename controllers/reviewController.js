const catchAsyc = require('../utils/catchAsyc');
const Review = require('../models/reviewModel');

exports.getAllReviews = catchAsyc(async (req, res, next) => {
  const reviews = await Review.find();
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
