const Review = require('../models/reviewModel');
// const AppError = require('../utils/appError');
// const catchAsyncError = require('../utils/catchAsyncError');
const factory = require('./handleFactory');

exports.getAllReviews = factory.getAll(Review, 'reviews');

exports.setTourUserIDs = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getReview = factory.getOne(Review, 'review');

exports.createReview = factory.createOne(Review, 'review');

exports.deleteReview = factory.deleteOne(Review, 'review');

exports.updateReview = factory.updateOne(Review, 'review');
