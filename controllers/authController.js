const User = require(`../models/userModel`);
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsyc = require('../utils/catchAsyc');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsyc(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt } =
    req.body;
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
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
