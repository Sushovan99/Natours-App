// Importing JWT
const jwt = require('jsonwebtoken');

// Importing promisify from node 'util' package
const { promisify } = require('util');

// Importing "User" Model
const User = require('../models/userModel');

// Async error handler function
const catchAsyncError = require('../utils/catchAsyncError');

// Create error message
const AppError = require('../utils/appError');

// Generating token based on User-ID
const signToken = async (id) => {
  const token = promisify(jwt.sign)({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  return token;
};

// Using the async error handler wrapper function
exports.signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // Creating a JWT token
  const token = await signToken(newUser._id);

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
  const user = await User.findOne({ email: email }).select('+password');

  // 3) If everything OK send JWT token to the client
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = await signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

// Authentication Middleware for protecting/restricting other routes
exports.protect = catchAsyncError(async (req, res, next) => {
  let token;
  // 1) Check if token is present in Header & if present get the token from the header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2) If there is no token send an error message with status 401(unauthorized)
  if (!token) {
    return next(
      new AppError('You are not logged in! Please login to get access', 401)
    );
  }

  // 3) Validating the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 4) Check if the current user still exists & if doesn't then throw a proper error
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }

  // 5) Check if the current user had changed the password after the JWT was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again!', 401)
    );
  }

  // 6) Grant access to the Protected/Restricted Routes
  req.user = currentUser;
  next();
});

// Authorization: User Roles and permissions

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Your are not admin!', 403));
    }
    next();
  };
