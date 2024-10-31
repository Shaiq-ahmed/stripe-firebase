const crypto = require('crypto');
const axios = require('axios'); // Make sure to install axios if you haven't already
require('dotenv').config();
// Your webhook secret from the Stripe dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 

// Create a test payload that mimics a Stripe webhook event
const payload = JSON.stringify({
    id: "evt_test_webhook",
    object: "event",
    type: "payment_intent.succeeded",
    data: {
        object: {
            id: "pi_3QCdMuSGnjrYRe421ue2irvP",
            amount: 11996,
            currency: "usd",
            customer: "cus_R4mhiHbnE9E1AX",
            metadata: {
                orderId: "671760ebf12ce2e01d522846"
            },
            status: "succeeded"
        }
    }
});

// Create a timestamp
const timestamp = Math.floor(Date.now() / 1000);

// Create the signature
const signature = crypto
    .createHmac('sha256', endpointSecret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

// Send the request to your webhook endpoint
const webhookUrl = 'http://localhost:8181/webhook'; // Replace with your actual webhook URL

axios.post(webhookUrl, Buffer.from(payload), {
    headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${signature}`
    }
})
.then(response => {
    console.log('Webhook sent successfully:', response.data);
})
.catch(error => {
    console.error('Error sending webhook:', error.response ? error.response.data : error.message);
});