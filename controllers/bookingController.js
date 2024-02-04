// Directly invoking the function with our secret key returned by stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Booking = require('../models/bookingModel');

const Tour = require('../models/tourModel');

const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async function (req, res, next) {
  // 1. Retrieve the tour details
  const tour = await Tour.findById(req.params.tourid);

  // 2. Create the Checkout Session using up-to-date syntax
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
          },
          unit_amount: tour.price,
          currency: 'inr',
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }price=${tour.price}
    }`,
    cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`,
    client_reference_id: req.params.tourId,
  });

  // 3. Send the session ID as the response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
