const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const morgan = require('morgan');

dotenv.config({
  path: `${__dirname}/config.env`,
});

const PORT = process.env.PORT || 3000;
const app = express();

// Reading tours-simple.json
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

// Body parser middleware
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Get all tours
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({ status: 'success', data: { tours } });
});

// Get single tour
app.get('/api/v1/tours/:id', (req, res) => {
  const ID = parseInt(req.params.id, 10);
  const tour = tours.find((el) => el.id === ID);

  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'Tour not found' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Create a tour
app.post('/api/v1/tours', (req, res) => {
  const newID = tours[tours.length - 1].id + 1;

  const newTour = { id: newID, ...req.body };
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) console.log(err);
      console.log('File written successfully');
    }
  );
  res.status(201).json({ status: 'success', data: { newTour } });
});

// Update a tour
app.patch('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
});

// Delete a tour
app.delete('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  }
  res.status(204).json({ status: 'success', data: null });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
