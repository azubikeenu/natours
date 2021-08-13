const Tour = require('../models/tourModel');
const QueryBuilder = require('../utils/queryBuilder');

// Route handlers
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns An array consisting of all tours
 */

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({ status: 'Fail', message: err });
  }
};

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

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} a single tour object
 */
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({ status: 'Success', data: { tour } });
  } catch (err) {
    res
      .status(404)
      .json({ status: 'Fail', message: 'Tour with id not found ' });
  }
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns void
 */
exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns{Object} updated tour
 */
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'Success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'Fail', message: err });
  }
};

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns null
 */
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({ status: 'Fail', message: err });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({ status: 'Fail', message: err });
  }
};

exports.getMonthlyPlan = async (req, res) => {
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
};
