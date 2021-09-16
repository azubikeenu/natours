const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Bookings = require('../models/bookingsModel');
const catchAsync = require('../utils/catchAsyc');

const factory = require('./handlerFactory');
// const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the currently booked tour
  const tour = await Tour.findById(req.params.id);

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}?tour=${
      req.params.id
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.id,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100, // since amount is in cents
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  //Create the checkout session as a response
  res.status(200).json({
    status: 'Success',
    session,
  });
});

exports.createBookingsCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Bookings.create({ tour, user, price });
  const redUrl = req.originalUrl
    .split('?')[0]
    .slice(0, req.originalUrl.length - 1);
  res.redirect(redUrl);
});

exports.getAllBookings = factory.getAll(Bookings);

exports.createBooking = factory.createOne(Bookings);

exports.getBooking = factory.getOne(Bookings);

exports.updateBooking = factory.updateOne(
  Bookings,
  'No document found with that id'
);

exports.deleteBooking = factory.deleteOne(
  Bookings,
  'No document found with that id'
);
