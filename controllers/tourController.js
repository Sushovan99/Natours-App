const Tour = require('../models/tourModel');

//--->> Tour Controllers/Handler functions
exports.getAllTours = async (req, res) => {
  try {
    // 1) Advanced filtering
    let queryString = JSON.stringify(req.query);
    queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (el) => `$${el}`);

    let query = Tour.find(JSON.parse(queryString));
    // 2) Sorting
    if (req.query.sort) {
      // request -> http://localhost:PORT/api/V1/tours?sort=price,ratingsAverage
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // Default sort -> Sorts from new to old
      query = query.sort('-createdAt');
    }

    // 3) Limiting fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v -createdAt');
    }
    // EXECUTE THE QUERY
    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // .findById() is the same as writing Tour.findOne({_id: req.params.id})
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Tour not found',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // We use .create() to create a single document. It takes in an Object.
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      // The new: true option returns the updated document
      new: true,
      // runValidators: if true, runs update validators on this command. Update validators validate the update operation against the model's schema
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
