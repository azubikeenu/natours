const catchAsync = require('../utils/catchAsyc');
const AppError = require('../utils/appError');
const QueryBuilder = require('../utils/queryBuilder');

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

exports.updateOne = (Model, errMessage) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError(errMessage, 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const tour = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions)
      query = Model.findById(req.params.id).populate(populateOptions);
    query = query.select('-__v');
    const doc = await query;
    if (!doc) {
      return next(new AppError('No doc found with that id', 404));
    }
    res.status(200).json({ status: 'Success', data: { data: doc } });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // to allow for nested route on reviews(hack)
    let filter = req.params.tourId ? { tour: req.params.tourId } : {};
    filter = req.params.userId
      ? { user: req.params.userId, ...filter }
      : filter;
    const builder = new QueryBuilder(Model.find(filter), req.query)
      .filter()
      .sort()
      .select()
      .paginate();
    const data = await builder.query;
    res.status(200).json({
      status: 'Success',
      result: data.length,
      data: {
        data,
      },
    });
  });
