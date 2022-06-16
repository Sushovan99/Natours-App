const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsyncErr = require('../utils/catchAsyncError');

exports.aliasTopTours = (req, _res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,price,summary,difficulty';
  next();
};

//--->> Tour Controllers/Handler functions
// Wrapping our handlers with catchAsyncErr() to handle error separately
exports.getAllTours = catchAsyncErr(async (req, res, _next) => {
  // BUILD THE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // EXECUTE THE QUERY
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

exports.getTour = catchAsyncErr(async (req, res, next) => {
  // .findById() is the same as writing Tour.findOne({_id: req.params.id})
  const tour = await Tour.findById(req.params.id);

  // Handling 404 error
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsyncErr(async (req, res, _next) => {
  // We use .create() to create a single document. It takes in an Object.
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      newTour,
    },
  });
});

exports.updateTour = catchAsyncErr(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    // The new: true option returns the updated document
    new: true,
    // runValidators: if true, runs schema validation before updating the document. If not provided then validation will not be performed.
    runValidators: true,
  });

  // Handling 404 error
  if (!updatedTour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
});

exports.deleteTour = catchAsyncErr(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({ status: 'success', data: null });
});

exports.getTourStats = catchAsyncErr(async (_req, res, _next) => {
  const stats = await Tour.aggregate([
    // 1st stage -> Filtering documents
    {
      // Here, we filtered the document based on the ratingsAverage
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    // 2nd stage -> Grouping documents
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    // 3rd stage
    {
      $sort: { avgPrice: 1 },
    },
    // We can do multiple $match in our aggregation pipeline,
    // {
    //   $match: { _id: { $ne: 'EASY' } }, We provide the _id: in uppercase because the _id is already converted to uppercase
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlans = catchAsyncErr(async (req, res, _next) => {
  const year = req.params.year * 1;
  const plans = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 3,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plans,
    },
  });
});
