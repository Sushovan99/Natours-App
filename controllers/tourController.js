// Core modules
const fs = require('fs');

// Reading tours-simple.json
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

// URL id validator
exports.checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  }
  next();
};

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
  res
    .status(200)
    .json({ status: 'success', requestedAt: req.currentTime, data: { tours } });
};

exports.getTour = (req, res) => {
  const ID = parseInt(req.params.id, 10);
  const tour = tours.find((el) => el.id === ID);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;

  const newTour = { id: newID, ...req.body };
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) console.log(err);
      console.log('File written successfully');
    }
  );
  res.status(201).json({ status: 'success', data: { newTour } });
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
