/* eslint-disable */
import axios from 'axios';
import {showAlert} from './alert'
const stripe = Stripe(
  'pk_test_51JaKS3AgVL7m3xndBBuDdNoheTisB6yZhrnhbeUo83PE1FKh31eMw6JrfDbAnSWoPT1NrJBoI5E60LDhOFSNe4kd00vhEs3LFd'
);

export const bookTour = async (tourId) => {
  // Get the check out session from API
  try{
    const session = await axios({
        method: 'GET',
        url: `http://127.0.0.1:4000/api/v1/bookings/checkout-session/${tourId}`,
      });

       // Use our stripe object to create the checkout form plus charge the credit card
      await stripe.redirectToCheckout({
          sessionId :session.data.session.id
      });

  }catch(err){
        showAlert("Error", err)
  }
};
