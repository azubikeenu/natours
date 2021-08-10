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
    const query = santizeQuery(req);
    //console.log(queryObject);
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    const tours = await Tour.find(query);
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
    res.status(404).json({ status: 'Fail', message: 'Tour with id not fond ' });
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
