const catchAsync = require('../utils/catchAsyc');
const AppError = require('../utils/appError');

exports.deleteOne = (Model, errMessage) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(errMessage, 404));
    }
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });
