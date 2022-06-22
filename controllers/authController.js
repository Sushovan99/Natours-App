// Importing JWT
const jwt = require('jsonwebtoken');

// Importing "User" Model
const User = require('../models/userModel');

// Async error handler function
const catchAsyncError = require('../utils/catchAsyncError');

// Create error message
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

// Using the async error handler wrapper function
exports.signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Creating a JWT token
  const token = signToken(newUser._id);

  // Sending back the token in the response back to the client
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if the user has actually send email & password in the req.body
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if the user exists && password is correct
  const user = await User.findOne({ email: email }).select({
    email: 1,
    password: 1,
  });

  // 3) If everything OK send JWT token to the client
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
