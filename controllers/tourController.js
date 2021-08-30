const Tour = require('../models/tourModel');
const QueryBuilder = require('../utils/queryBuilder');
const catchAsync = require('../utils/catchAsyc');
const AppError = require('../utils/appError');

// Route handlers
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns An array consisting of all tours
 */

exports.getAllTours = catchAsync(async (req, res, next) => {
  const builder = new QueryBuilder(Tour.find(), req.query)
    .filter()
    .sort()
    .select()
    .paginate();
  const tours = await builder.query;
  res.status(200).json({
    status: 'Success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

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

/*
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} a single tour object
 */
exports.getTour = catchAsync(async (req, res, next) => {
  let query = Tour.findById(req.params.id).populate('reviews');
  query = query.select('-__v');
  const tour = await query;
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(200).json({ status: 'Success', data: { tour } });
});

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns void
 */
exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns{Object} updated tour
 */
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: {
      tour: tour,
    },
  });
});

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns null
 */
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

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
