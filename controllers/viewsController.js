const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsyc');

exports.getOverview = catchAsync(async (req, res, next) => {
  // get tour from database
  const tours = await Tour.find();
  // build the template
  //render the template using extracted data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  res.status(200).render('tour', { title: tour.name, tour });
});
