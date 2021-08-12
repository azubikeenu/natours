const Tour = require('../models/tourModel');
const { santizeQuery } = require('../utils');

// Route handlers
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns An array consisting of all tours
 */
exports.getAllTours = async (req, res) => {
  try {
    const queryObject = santizeQuery(req);

    //console.log(queryObject);
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // SORTING
    let query = Tour.find(queryObject);
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    // SELECTING FIELDS
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    //PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const totalTours = await Tour.countDocuments();
      if (skip >= totalTours) throw new Error('Page does not exist');
    }
    //  Execute query
    const tours = await query;

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
    // Tour.findOne({_id :req.param.id})
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
    res.status(400).json({ status: 'fail', message: 'Invalid data sent!!' });
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
