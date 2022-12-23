const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');

exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  const review = await Review.find();

  if (!review.length) {
    return next(new AppError('There are currently no reviews', 404));
  }

  res.status(200).json({
    status: 'success',
    results: review.length,
    data: {
      review,
    },
  });
});

exports.createReview = catchAsyncError(async (req, res, next) => {
  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    tour: req.body.tour,
    user: req.body.user,
  });

  res.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});
