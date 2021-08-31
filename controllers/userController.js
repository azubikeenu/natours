const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsyc');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filteredBody = (obj, ...allowedFields) => {
  const filteredObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filteredObject[el] = obj[el];
  });
  return filteredObject;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // create an error if the user tries to update the password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This route is not for password updates,Please use /updatePassword route`,
        404
      )
    );
  }
  // filter unwanted user fields
  const filteredObject = filteredBody(req.body, 'name', 'email');
  // update the user document
  const user = await User.findByIdAndUpdate(req.user._id, filteredObject, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'Success',
    user,
  });
});

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'Success',
    data: null,
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'Route not defined :( please use signup',
  });
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);
// DO NOT CHANGE PASSWORDS
exports.updateUser = factory.updateOne(User, 'No user found with that id');

exports.deleteUser = factory.deleteOne(User, 'No user found with that id');
