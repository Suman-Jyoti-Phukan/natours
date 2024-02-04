const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

const AppError = require('./utils/appError');

const path = require('path');

const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const hpp = require('hpp');
const app = express();

app.use(cors());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'developement') {
  app.use(morgan('dev'));
}

// Limit requests for same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , Please try again in an hour ',
});
app.use('/api', limiter);

app.use(
  express.json({
    limit: '10kb',
  })
);

app.use(cookieParser());

app.use(express.urlencoded({ extended: true, limit: '20kb' }));

app.use(mongoSanitize());

//Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'average',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// Sub-Router
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bookings', bookingRouter);

// For all the routes not mentioned above
app.all('*', (req, res, next) => {
  next(
    new AppError(`Can't find ${req.originalUrl} available on the server!`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
