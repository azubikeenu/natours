const User = require(`../models/userModel`);
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const catchAsyc = require('../utils/catchAsyc');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// this generates a new  JWT for the user
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsyc(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt, role } =
    req.body;
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
  });
  const token = signToken(user._id);
  res.status(201).json({
    status: 'Success',
    token,
    data: { user },
  });
});

exports.logIn = catchAsyc(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password exists
  if (!email || !password) {
    const err = new AppError('Please provide email and password', 400);
    return next(err);
  }
  // check if email and password is correct
  const user = await User.findOne({ email }).select('+password');

  //if everything is ok send the token to the client
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    token,
  });
});

exports.protect = catchAsyc(async (req, res, next) => {
  // get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
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
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    next();
  };

exports.forgotPassword = catchAsyc(async (req, res, next) => {
  // get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(AppError('No user with that email address', 404));
  // generate the random token,
  const resetToken = user.createPasswordResetToken();
  // this prevents mongoose validation on save , since we are modifying the fields
  await user.save({ validateBeforeSave: false });
  //send user an email with the random token
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password , submit a patch request with your new password and password confirm to
    ${resetUrl}.\n If you didnt forget your password , ignore this message`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Your password rest token , valid for only 10 mins`,
      message,
    });
  } catch (err) {
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was a problem sending the email', 500));
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
    passwordResetExpires: { $gt: Date.now() },
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
  const newToken = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    token: newToken,
  });
});
