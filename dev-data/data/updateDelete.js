const mongoose = require('mongoose');

const fs = require('fs');

const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './config.env' });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

async function connectDb() {
  try {
    await mongoose.connect(DB);
    console.log('DB Connection Successfull');
  } catch (err) {
    console.log('Failed To Connect', err.message);
  }
}

connectDb();

async function deleteTours() {
  try {
    await Tour.deleteMany();

    await User.deleteMany();

    await Review.deleteMany();
  } catch (err) {
  } finally {
    process.exit();
  }
}

async function updateTour() {
  try {
    const reviewData = await Review.create(reviews);

    const userData = await User.create(users, {
      validateBeforeSave: false,
    });

    const toursData = await Tour.create(tours, {
      validateBeforeSave: false,
    });
  } catch (err) {
    console.log('Err Updating Tours : ', err.message);
  } finally {
    process.exit();
  }
}

if (process.argv[2] === '--delete') {
  deleteTours();
} else if (process.argv[2] === '--update') {
  updateTour();
}
