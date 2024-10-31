import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        // Call your backend to create a Payment Intent
        const { data: { clientSecret } } = await axios.post('/purchase', {
            userId: 'USER_ID',
            productId: 'PRODUCT_ID',
            quantity: 1,
        });

        // Confirm the payment with the card details
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (error) {
            console.error('Payment failed:', error);
            // Handle payment failure (e.g., show error message to user)
        } else {
            if (paymentIntent.status === 'succeeded') {
                console.log('Payment successful!');
                // Optionally, notify your backend of the successful payment
                await axios.post('/payment-success', {
                    paymentIntentId: paymentIntent.id,
                    userId: 'USER_ID',
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe}>Pay</button>
        </form>
    );
};




// Endpoint to handle successful payment notification
app.post("/payment-success", async (req, res) => {
    const { paymentIntentId, userId } = req.body;

    try {
        // Optionally, retrieve the payment intent from Stripe to verify its status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Update order status, send notifications, etc.
            const order = await Order.findOne({ paymentIntentId });
            if (order) {
                order.status = 'paid';
                await order.save();
            }

            // Send notification to the user
            await sendNotification([userId], 'Purchase Successful', 'Your purchase was successful!', '/orders', '/path/to/icon.png');

            res.status(200).json({ message: 'Payment confirmed and order updated.' });
        } else {
            res.status(400).json({ error: 'Payment not successful' });
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: error.message });
    }
});