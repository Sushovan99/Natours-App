// Importing JWT
const jwt = require('jsonwebtoken');

// Importing "User" Model
const User = require('../models/userModel');

// Async error handler function
const catchAsyncError = require('../utils/catchAsyncError');

// Using the async error handler wrapper function
exports.signup = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Creating a JWT token
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  // Sending back the token in the response back to the client
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
