const User = require(`../models/userModel`);
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const catchAsyc = require('../utils/catchAsyc');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// this generates a new  JWT for the user
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // set the cookie
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  // prevent password from being shown in the response object
  user.password = undefined;
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: { user },
  });
};

exports.signUp = catchAsyc(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();
  createAndSendToken(user, 201, res);
});

exports.logIn = catchAsyc(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password exists
  if (!email || !password) {
    const err = new AppError('Please provide email and password', 400);
    return next(err);
  }

  // extract the password
  const user = await User.findOne({ email }).select('+password');

  //compare the hashedpassword and supplied password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //if everything is ok send the token to the client
  createAndSendToken(user, 200, res);
});

// Authentication Logic
exports.protect = catchAsyc(async (req, res, next) => {
  // get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('Please login to continue', 401));
  }
  // verify the token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // if the verification is successful check if user still exists
  const returnedUser = await User.findById(decodedToken.id);
  if (!returnedUser) return next(new AppError(`The user doesn't exist`, 401));
  // check if  user changed password after the token was issued
  if (returnedUser.hasChangedPassword(decodedToken.iat))
    return next(
      new AppError(
        'Password was changed recently, Please log in with new password',
        401
      )
    );
  // grant access to protected route
  req.user = returnedUser;
  res.locals.user = returnedUser;
  next();
});

// only for public pages
exports.isLoggedIn = async (req, res, next) => {
  // get the token and check if it exists
  let token;
  let decodedToken;
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;
      decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      // if the verification is successful check if user still exists
      const returnedUser = await User.findById(decodedToken.id);
      if (!returnedUser) return next();
      // check if  user changed password after the token was issued
      if (returnedUser.hasChangedPassword(decodedToken.iat)) return next();
      // There is a user logged in ;
      res.locals.user = returnedUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  // verify the token
  next();
};

// Authorization logic
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };

exports.forgotPassword = catchAsyc(async (req, res, next) => {
  // get user based on supplied email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(AppError('No user with that email address', 404));
  // generate the random token,
  const resetToken = user.createPasswordResetToken();
  // this prevents mongoose validation on save , since we are modifying the fields
  await user.save({ validateBeforeSave: false });

  //send user an email with the random token
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetUrl).sendPasswordReset();
  } catch (err) {
    // rollback if an error occurs
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was a problem in sending the email', 500));
  }

  res.status(200).json({
    status: 'Success',
    message: 'Token sent to email',
  });
});

exports.resetPassword = catchAsyc(async (req, res, next) => {
  const token = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  //get the user based on the token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }, // this only returns of the reset token is still valid
  });
  // if the token is not expired set the new password
  if (!user) return next(new AppError('Token is invalid or has Expired', 400));

  // update the new password for the new user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //generate a new token
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsyc(async (req, res, next) => {
  //get the user from the collection
  const user = await User.findById(req.user._id).select('+password');
  // check if the given password  is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError(`Password incorrect, Did you forget your password`, 400)
    );
  }
  // if the password is correct update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // we use save() because mongoose validators and prehooks will not work or update
  await user.save();
  // generate a new token and log the user
  createAndSendToken(user, 201, res);
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'Success' });
};
