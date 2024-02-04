// const catchAsync = require('./../utils/catchAsync');

const Review = require('../models/reviewModel');

const factory = require('./handlerFactory');

// exports.getAllReview = catchAsync(async (req, res, next) => {
//   let filter = {};

//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter).select('-__v');

//   res.status(200).json({
//     lenght: reviews.length,
//     status: 'Success',
//     data: { review: reviews },
//   });
// });

exports.getAllReview = factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;

  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = factory.createOne(Review);

// exports.createReview = catchAsync(async (req, res) => {
//   //Allow Nested Routes

//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'Created',
//     data: {
//       review: newReview,
//     },
//   });
// });

exports.getReview = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
