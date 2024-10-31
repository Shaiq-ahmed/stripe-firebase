// src/Payment.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Payment = () => {
    const [quantity, setQuantity] = useState(1); // Default quantity to 1
    const [userId, setUserId] = useState('67235bd7b937e5bd2f87fed7'); // Assume you have userId from your authentication
    const [productId, setProductId] = useState('67175f3ce24bf957dbbf904e');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const stripe = useStripe();
    const elements = useElements();

    const handlePayment = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!stripe || !elements) {
            setError('Stripe.js has not loaded yet. Please try again later.');
            return;
        }

        // Get a reference to the card element
        const cardElement = elements.getElement(CardElement);

        try {
            // Create a purchase on the server
            const { data } = await axios.post('https://r7chnqt6-8181.inc1.devtunnels.ms/purchase', {
                userId,
                productId,
                quantity, // Send the quantity to the backend
            });
            console.log(data.clientSecret)
            // Confirm the payment
            const { error: paymentError } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: cardElement, // Use the CardElement reference
                },
            });

            if (paymentError) {
                setError(paymentError.message);
            } else {
                setSuccess('Payment successful!');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h1>Payment</h1>
            <form onSubmit={handlePayment}>
                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1" // Ensure quantity is at least 1
                />
                <CardElement />
                <button type="submit">Pay</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
        </div>
    );
};

export default Payment;




