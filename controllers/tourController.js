const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsyc');
const factory = require('./handlerFactory');

// Route handlers
exports.getAllTours = factory.getAll(Tour);

/**
 * @description this returns the top 5 cheapest tours
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.bestCheap = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-price ratingsAvg';
  req.query.fields = 'name,price,ratingsAvg,summary,difficulty';
  next();
};

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour, 'No tour found with that id');
exports.deleteTour = factory.deleteOne(Tour, 'No tour found with that id');

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stat = await Tour.aggregate([
    { $match: { ratingsAvg: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRating: { $avg: '$ratingsAvg' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: { stat },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: { name: '$name' } },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    { $sort: { numTours: -1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});
