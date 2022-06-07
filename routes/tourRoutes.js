const express = require('express');

const tourController = require(`${__dirname}/../controllers/tourController.js`);

// ------>> Tour Routes
// Creating separate router for each route. Both of these are now middlewares
const tourRouter = express.Router();

// Param middleware
// tourRouter.param('id', tourController.checkID);
tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
