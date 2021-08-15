/**
 * for some reason the global error middleware doesnt work in the production evironment so i have to make use of the console.log()
 */

const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicate = (err) => {
  const message = `Duplicate value for ${err.keyValue.name}, please use another value`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join(` , `);
  const message = `Invalid inputs data: ${errors}`;
  return new AppError(message, 400);
};

// const sendDevError = (err, res) => {
//   res.status(err.statusCode).json({
// status: err.status,
// message: err.message,
// error: err,
// stack: err.stack,
//   });
// };

// this was orginally production errorResponse
const sendError = (err, res) => {
  // operational error  that can be sent to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 🔥', err);
    res.status(500).json({
      status: 'Fail',
      message: 'Something went wrong',
      error: err,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') console.log(err);
  let error = { ...err };
  if (err.name === 'CastError') error = handleCastError(error);
  if (err.code === 11000) error = handleDuplicate(error);
  if (err.name === 'ValidationError') error = handleValidationError(error);
  sendError(error, res);
};
