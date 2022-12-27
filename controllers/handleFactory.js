const catchAsyncErr = require('../utils/catchAsyncError');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model, resourceName) =>
  catchAsyncErr(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`No ${resourceName} found with that ID`, 404));
    }
    res.status(204).json({ status: 'success', data: null });
  });

exports.createOne = (Model, _resourceName) =>
  catchAsyncErr(async (req, res, _next) => {
    // We use .create() to create a single document. It takes in an Object.
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model, resourceName) =>
  catchAsyncErr(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      // The new: true option returns the updated document
      new: true,
      // runValidators: if true, runs schema validation before updating the document. If not provided then validation will not be performed.
      runValidators: true,
    });

    // Handling 404 error
    if (!doc) {
      return next(new AppError(`No ${resourceName} found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        [resourceName]: doc,
      },
    });
  });

exports.getOne = (Model, resourceName, populateOptions) =>
  catchAsyncErr(async (req, res, next) => {
    const query = Model.findById(req.params.id);

    if (populateOptions) query.populate(populateOptions);

    const doc = await query;

    // Handling 404 error
    if (!doc) {
      return next(new AppError(`No ${resourceName} found with that ID`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        [resourceName]: doc,
      },
    });
  });

exports.getAll = (Model, resourceName) =>
  catchAsyncErr(async (req, res, _next) => {
    // To allow nested Reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // BUILD THE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // EXECUTE THE QUERY
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        [resourceName]: doc,
      },
    });
  });
