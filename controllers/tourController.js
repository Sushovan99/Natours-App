const Tour = require('../models/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
// const AppError = require('../utils/appError');
const catchAsyncErr = require('../utils/catchAsyncError');
const factory = require('./handleFactory');

exports.aliasTopTours = (req, _res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,price,summary,difficulty';
  next();
};

//--->> Tour Controllers/Handler functions
// Wrapping our handlers with catchAsyncErr() to handle error separately
exports.getAllTours = factory.getAll(Tour, 'tours');

exports.getTour = factory.getOne(Tour, 'tour', { path: 'reviews' });

exports.createTour = factory.createOne(Tour, 'tour');

exports.updateTour = factory.updateOne(Tour, 'tour');

exports.deleteTour = factory.deleteOne(Tour, 'tour');

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
