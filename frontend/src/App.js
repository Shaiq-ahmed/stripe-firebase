// src/App.js
import React, { useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Payment from './Payment';
import { toast, ToastContainer } from "react-toastify";
import Message from "./Message";
import "react-toastify/dist/ReactToastify.css";
import Register from './Register';
import { messaging } from './firebase';
import { onMessage } from 'firebase/messaging'; // Import onMessage 

const App = () => {
    useEffect(() => {
        // Set up the onMessage listener
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Notification received in App:', payload);
            toast(<Message notification={payload.notification} />);
        });
        // Cleanup the listener on component unmount
        return () => {
            unsubscribe();
        };
    }, []); 

    return (
        <div>
            <ToastContainer />
            <Elements stripe={loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)}>
                <Payment />
            </Elements>
            <Register />
        </div>
    );
};

export default App;