const User = require(`../models/userModel`);
const catchAsyc = require('../utils/catchAsyc');

exports.signUp = catchAsyc(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: { user },
  });
});
