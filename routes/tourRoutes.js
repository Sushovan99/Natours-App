const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

// ------>> Tour Routes
// Creating separate router for each route. Both of these are now middlewares
const router = express.Router();

// Instead of importing the controller we'll import the router because we already have a controller in "tourRoutes.js" which does the same-thing. Here, we're just duplicating the code.
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

// "router" is also a middleware. We're telling the router in the tourRoute to use "reviewRouter" if it hits this specific route.
router.use('/:tourId/reviews', reviewRouter);

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
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
