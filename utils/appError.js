/**
 * @description : the AppError class is used to handle operational errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Pass';
    this.isOperational = true;
    // capture/preserve the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
