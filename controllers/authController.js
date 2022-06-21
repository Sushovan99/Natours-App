// Importing "User" Model
const User = require('../models/userModel');

// Async error handler function
const catchAsyncError = require('../utils/catchAsyncError');

// Using the async error handler wrapper function
exports.signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
