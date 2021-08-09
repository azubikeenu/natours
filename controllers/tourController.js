const Tour = require('../models/tourModel');

// Route handlers
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns An array consisting of all tours
 */
exports.getAllTours = (req, res) => {
  // res.status(200).json({
  //   status: 'Success',
  //   results: tours.length,
  //   data: { tours },
  // });
};
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} a single tour object
 */
exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  // const foundTour = tours.find((tour) => tour.id === id);
  // res.status(200).json({ status: 'Success', data: { tour: foundTour } });
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
exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'Success',
    data: {
      tour: `Tour with id : ${req.params.id} Updated`,
    },
  });
};
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns null
 */
exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'Success',
    data: null,
  });
};
