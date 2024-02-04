const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const reviewRouter = require('./../routes/reviewRoutes');

//Not a middle ware but a modular routing system
const router = express.Router();

router.route('/:id').get(tourController.getTour);

router.use('/:tourId/reviews', reviewRouter);

// // Tour will not work for user. So, we can think each router is a sub router for one for each router. This route.param() is specific to tourRouter middleware
// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router
  .route('/')
  .get(
    // authController.protect,
    // authController.restrictTo('admin', 'lead-guide'),
    tourController.getAllTours
  )
  .post(tourController.createTour);

router
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
