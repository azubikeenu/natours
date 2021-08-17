const User = require(`../models/userModel`);
const jwt = require('jsonwebtoken');
const catchAsyc = require('../utils/catchAsyc');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsyc(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const user = await User.create({ name, email, password, passwordConfirm });
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
