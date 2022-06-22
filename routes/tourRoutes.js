const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// ------>> Tour Routes
// Creating separate router for each route. Both of these are now middlewares
const router = express.Router();

// Using .aggregate()
router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plans/:year').get(tourController.getMonthlyPlans);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
