const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');
const factory = require('./handleFactory');

const filterBody = (reqestBody, ...allowedFields) => {
  const reqObj = {};
  Object.keys(reqestBody).forEach((el) => {
    if (allowedFields.includes(el)) {
      reqObj[el] = reqestBody[el];
    }
  });

  return reqObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.getAllUsers = factory.getAll(User, 'users');

exports.updateMe = catchAsyncError(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This is not a route for password update. Please use '/updateMyPassword route.'",
        400
      )
    );
  }

  const filteredObj = filterBody(req.body, 'email', 'name');

  const user = await User.findByIdAndUpdate(req.user._id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteMe = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route will not be defined' });
};

exports.getUser = factory.getOne(User, 'user');

// Not for updating passwords
exports.updateUser = factory.updateOne(User, 'user');

// Only for admin
exports.deleteUser = factory.deleteOne(User, 'user');
