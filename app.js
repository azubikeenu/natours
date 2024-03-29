const express = require('express');
const path = require('path');
const cors = require('cors');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRouter');
const bookingRouter = require('./routes/bookingRoutes');

const viewRouter = require('./routes/viewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//MIDDLEWARES
//set template engine at the beginning of the middleware chain

app.enable('trust proxy');

app.set('view engine', 'pug');
//select path directory
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.options('*', cors());

// SERVING  STATIC  FILES
app.use(express.static(path.join(__dirname, 'public')));

// DEV LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CREATE A RATE LIMITER
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP please try again in an hour',
});
app.use('/api', limiter);

// BODY PARSER (reading JSON data format from the  body into req object)
app.use(express.json({ limit: '10kb' }));

// USING THE COOKIE-PARSER
app.use(cookieParser());

// body parser for form body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data Sanitization against noSQL injection
app.use(mongoSanitize());

//  Data Sanitization against XSS
app.use(xss());

//Prevent parameter pollution

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      ' ratingsAvg',
      'price',
      'role',
    ],
  })
);

app.use(compression());

//SET SECURITY FOR HTTP HEADERS
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      'script-src': [
        "'self'",
        'https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.js',
        'https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.4/axios.min.js',
        'https://js.stripe.com/',
      ],
      'worker-src': ["'self'", 'blob:'],
      'connect-src': [
        "'self'",
        'https://api.mapbox.com/',
        'https://events.mapbox.com/',
      ],
      'frame-src': ["'self'", 'https://js.stripe.com/'],
    },
  })
);

//ROUTES

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bookings', bookingRouter);

// handle page not found for all other routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

// global error handler
app.use(globalErrorHandler);

module.exports = app;
