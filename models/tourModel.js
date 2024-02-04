const mongoose = require('mongoose');

const slugify = require('slugify');

const User = require('./userModel');

const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    // Schema Defination
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour name must have less or equal then 40 characters.',
      ],
      minLength: [
        10,
        'A tour name must have less or equal then 10 characters.',
      ],
      // validate: [validator.isAlpha, 'Tour Name must contain only characters'],
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: "Difficulty is either : 'easy', 'medium' , 'difficult'",
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      set: (value) => Math.round(value * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: true,
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price; //100 < 200
        },
        message: 'Discount price {{VALUE}} Should Be Below The Regular Price',
      },
    },

    summary: {
      type: String,
      trim: true, //Removes All The White Space || Only For String
      required: [true, 'A tour must have a summary'],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must a cover image'],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],

    secretTrue: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },

        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //We can populate only on the query not on the database.
    //getTour ->  tourController
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review',
    //   },
    // ],
  },

  {
    // Schema Options
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({
  price: 1,
  ratingsAverage: -1,
});
tourSchema.index({
  slug: 1,
});

tourSchema.index({
  startLocation: '2dsphere',
});

//Virtual Properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// Embedding
tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));

  this.guides = await Promise.all(guidesPromises);
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

//Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTrue: { $ne: true } },
  });
  next();
});

// 2 . Creating Models
// Convention to use Model name as Capital
const Tour = mongoose.model('Tour', tourSchema);

/* 
3. Creating Document And Uplaoding It On the database
const newTour = new Tour({
  name: 'The Forest Hiker',
  rating: 4.5,
  price: 600,
}); 
*/

// newTour.save().then((doc) => console.log(doc));

// Only runs for .save() and create()  and doesnot work for find insertMany()
module.exports = Tour;
