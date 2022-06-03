// Our own modules
const Tour = require('../models/tourModel');

// Check the body of request object
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Must have name & price' });
  }
  next();
};

//--->> Tour Controllers/Handler functions
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.currentTime,
    // results: tours.length,
    // data: { tours }
  });
};

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    // data: {
    //   tour,
    // },
  });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    // data: { newTour }
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({ status: 'success', data: null });
};
