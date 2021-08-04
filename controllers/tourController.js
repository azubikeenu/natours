const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

//validation for payload fields price and name

exports.checkRequestBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'Fail',
      data: { message: 'Bad Request' },
    });
  }
  next();
};

//validation for id parameter

/**
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @param {Number} value
 * @returns Object
 */
exports.checkID = (req, res, next, value) => {
  // eslint-disable-next-line no-restricted-globals
  if (tours.length < value * 1 || isNaN(value)) {
    return res
      .status(404)
      .json({ status: 'Fail', data: { message: 'Invalid Id' } });
  }
  next();
};

// Route handlers
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns An array consisting of all tours
 */
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: { tours },
  });
};
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} a single tour object
 */
exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const foundTour = tours.find((tour) => tour.id === id);
  res.status(200).json({ status: 'Success', data: { tour: foundTour } });
};
/**
 *
 * @param {Object} req
 * @param {Object} res
 * @returns void
 */
exports.createTour = (req, res) => {
  const id = tours[tours.length - 1].id + 1;
  const newTour = { id, ...req.body };
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ status: 'Fail', data: { message: 'An error occured' } });
      res.status(201).json({ status: 'Success', data: { newTour } });
    }
  );
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
