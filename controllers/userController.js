const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsyc');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// if you dont need image processing

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     const filename = ` user-${req.user.id}-${Date.now() + 1}.${ext}`;
//     cb(null, filename);
//   },
// });

//ideal for image processing
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Not an image! please upload only images', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = ` user-${req.user.id}-${Date.now() + 1}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

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
  // adding photo to the payload
  if (req.file) filteredObject.photo = req.file.filename;
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

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
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
