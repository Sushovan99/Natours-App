const express = require('express');

const tourController = require(`${__dirname}/../controllers/tourController.js`);

// ------>> Tour Routes
// Creating separate router for each route. Both of these are now middlewares
const tourRouter = express.Router();

// Param middleware
// tourRouter.param('id', tourController.checkID);

tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);
tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
