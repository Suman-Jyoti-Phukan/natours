const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must belong to a tour'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', //Model
        required: [true, 'A review must belong to a user'],
      },
    ],
  },
  {
    // Schema Options
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index(
  {
    tour: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

// reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'user',
//   }).populate({
//     path: 'tour',
//   });
// });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour', // user that we defined in our schema
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  // this.populate({
  //   path: 'user', // user that we defined in our schema
  //   select: 'name',
  // }).
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// reviewSchema.pre(/^find/, function (next) {
//   console.log('Middleware Initiated Two');
//   this.populate({
//     path: 'tour',
//   });
//   next();
// });

reviewSchema.statics.calAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        nRating: {
          $sum: 1,
        },
        avgRating: {
          $avg: '$rating',
        },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //This points to current review

  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calAverageRatings(this.r.tour);
});

//Issue is in the two top functions
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
