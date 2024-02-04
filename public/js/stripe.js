import axios from 'axios';

import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51OY3jESIoMO6zyIsWFTT9UWs65zcBk4w9wNW9CKKHXoWny5VG70XLMKZMH5zKmRlXTvCoO37Jxf3w80UAetGgfzq00ISVZw5qp'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('err', err);
  }
};
