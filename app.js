const express = require('express');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
//MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CREATE A RATE LIMITER
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP please try again in an hour',
});

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use('/api', limiter);

app.use((req, res, next) => {
  console.log('This is a test middleware');
  next();
});
//ROUTES
app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

// handle page not found for all other routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

// global error handler
app.use(globalErrorHandler);

module.exports = app;
