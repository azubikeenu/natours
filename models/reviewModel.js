const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating cannot be empty'],
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // adding virtual props
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// adding unique tour user field
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'user',
  //     select: 'name photo',
  //   }).populate({
  //     path: 'tour',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// creating static methods
reviewSchema.statics.calculateAverages = async function (tourId) {
  // returns an array
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  // find the currentTour and Update
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAvg: stats[0].averageRating,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAvg: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calculateAverages(this.tour);
});

// update number of ratings and average ratings on review update
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // get the doc before the query executes
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  //this.findOne(); doesnt work here because data has been updated
  if (!this.r) {
    return next(new AppError('The document is not found in the db', 404));
  }
  await this.r.constructor.calculateAverages(this.r.tour);
});

module.exports = mongoose.model('Review', reviewSchema);
