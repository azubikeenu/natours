const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsyc');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find({});
  res.status(200).json({
    status: 'Success',
    result: users.length,
    data: {
      users,
    },
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({ status: 'Error', message: 'Route not defined' });
};
exports.createUser = (req, res) => {
  res.status(500).json({ status: 'Error', message: 'Route not defined' });
};
exports.updateUser = (req, res) => {
  res.status(500).json({ status: 'Error', message: 'Route not defined' });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({ status: 'Error', message: 'Route not defined' });
};
