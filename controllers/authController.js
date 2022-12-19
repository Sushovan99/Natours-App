// Importing JWT
const jwt = require('jsonwebtoken');

// Importing promisify from node 'util' package
const { promisify } = require('util');

// Importing crypto from cryto.js
const crypto = require('crypto');

// Importing "User" Model
const User = require('../models/userModel');

// Async error handler function
const catchAsyncError = require('../utils/catchAsyncError');

// Create error message
const AppError = require('../utils/appError');

// Send Password Reset Link
const sendMail = require('../utils/email');

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

  /*
  6) Grant access to the Protected/Restricted Routes & storing the login user's details 
    in the request Object so, that we can access it in th next middleware function
  */
  req.user = currentUser;
  next();
});

// Authorization: User Roles and permissions
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    /*
      We store the user's data in the "protect" middleware so that we specifically have access to the user's
      role. Here, we use the user's role for Authorization.
    */
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Your are not admin!', 403));
    }
    next();
  };

// Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on the POSTed email & If user doesn't exist throw a proper error
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // 2) Generate a random reset token
  const resetToken = user.createPasswordResetToken();

  /*
  1) createPasswordResetToken() modifies the passwordResetToken & passwordResetExpires it doesn't save it
    in the DB. We need to manually save it using .save() method.
  2) We also need to stop the schema validation to save these two modified field. 
  */
  await user.save({ validateBeforeSave: false });

  // 3) Create a Reset URL alongwith the Reset Token
  const resetURL = `${req.protocol}//${req.get(
    'host'
  )}/api/V1/users/resetPassword/${resetToken}`;

  // 4) Create a proper password reset message with the "resetURL"
  const message = `Forgot Password? Submit a PATCH request with your new password & passwordConfirm to: ${resetURL}.\nIf you didn't forgot your password, please ignore this email`;

  // 5) Send the mail to the user with the message
  try {
    await sendMail({
      email: user.email,
      subject: 'Your password Reset token(Valid for 10min)',
      message: message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Reset password link has been sent to your email!',
    });
  } catch (err) {
    // 6) Handling the error
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was problem sending the email. Try again later!', 500)
    );
  }
});

// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  // 2) If token hasn't expired and user exists, set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update passwordChangedAt property -> We do it using the mongoose middlewares/hooks
  // 4) Log the user in & send the JWT
  const token = await signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

// Update already login user password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  // 1) Get user from the collection
  const user = await User.findById(req.user._id).select('password');

  // 2) Check if POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3) If, so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Login user, Send JWT
  const newToken = await signToken(user._id);
  res.status(200).json({
    status: 'success',
    token: newToken,
  });
});
