// src/Register.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { messaging } from './firebase'; // Import the messaging service
import { getToken } from 'firebase/messaging';

const Register = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [fcmToken, setFcmToken] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            // Request permission to send notifications
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                // Get the FCM token
                const token = await getToken(messaging, { vapidKey: 'BHMoB_Khlj3TJCZJ_oPMqDM08M4tOx43m5X2e8m137a3r1OFe8RgsqTk4gwvCo2N5lfYTwZ9hI90gDKA8q8sdqg' }); // Use your VAPID key
                setFcmToken(token);
                console.log('FCM Token:', token);

                // Send registration data to your backend
                const response = await axios.post('https://r7chnqt6-8181.inc1.devtunnels.ms/register', {
                    email,
                    name,
                    fcmToken: token, // Send the token to your backend
                });

                console.log('User registered:', response.data);
            } else {
                console.error('Notification permission denied');
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;