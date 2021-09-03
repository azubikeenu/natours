const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsyc');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

// Route handlers
exports.getAllTours = factory.getAll(Tour);

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

//tours-within/:distance/center/:longlat/units/:unit
//tours-within/233/center/33.905051987179775,-118.13351341244383/units/miles
///tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, long] = latlng.split(',');
  if (!long || !lat) {
    return next(new AppError(`Please provide in the format long,lat`, 400));
  }
  const radius = unit === 'miles' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, long] = latlng.split(',');
  if (!long || !lat) {
    return next(new AppError(`Please provide in the format long,lat`, 400));
  }
  const multiplier = unit === 'miles' ? 0.000621371 : 0.001;
  // geoNear requires that one of our field contains a geoSpatial index
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [long * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: { distance: 1, name: 1 },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      data: distances,
    },
  });
});
