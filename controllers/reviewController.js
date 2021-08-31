const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);

//middleware to set tour and user id on create tour
exports.setTourAndUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review, 'No review found with id');
exports.deleteReview = factory.deleteOne(Review, 'No review with that id');
exports.getReview = factory.getOne(Review);
