const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const admin = require('./firebase');
const bodyParser = require('body-parser');
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { User, Product, Order, Notification } = require("./model");

const PORT = process.env.PORT || 8181;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

const sendNotification = async (userIds, title, body, url, icon) => {
    const users = await User.find({ _id: { $in: userIds } });
    const tokens = users.map(user => user.fcmToken).filter(token => token);

    const message = {
        notification: {
            title: title,
            body: body,
            // Remove icon from here
        },
        data: {
            url: url, // Add URL for navigation
            icon: icon, // Include icon in the data payload
        },
        tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Notifications sent:', response);

    // Optionally, save the notification to the database
    for (const userId of userIds) {
        const notification = new Notification({ userId, title, body, url, icon });
        await notification.save();
    }
};
// Webhook endpoint
app.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    console.log("Received webhook event:", req.body);
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        const order = await Order.findById(orderId);
        if (order) {
            order.status = "completed"; // Update order status
            await order.save();

            // Reduce product quantity
            const product = await Product.findById(order.productId);
            if (product) {
                product.quantity -= order.quantity; // Reduce the quantity
                await product.save();
            }
        }
        await sendNotification([paymentIntent.metadata.userId], 'Purchase Successful', 'Your purchase was successful!', '/orders', '/path/to/icon.png');
        console.log('PaymentIntent was successful!');
    }

    res.json({ received: true });
});


// Middlewares 
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Routes 
app.get("/", (req, res) => {
    res.send("Hello World");
});


//send Notification

// User registration
app.post("/register", async (req, res) => {
    const { email, name, fcmToken } = req.body;
    try {
        const customer = await stripe.customers.create({ email, name });
        const user = new User({ email, name, stripeCustomerId: customer.id, fcmToken });
        await user.save();
        await sendNotification([user._id], 'Welcome!', 'Thank you for registering!', '/', '/path/to/icon.png');
        return res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/create-product", async (req, res) => {
    const { name, price, quantity } = req.body;
    const product = new Product({ name, price, quantity });
    await product.save();
    res.status(201).json(product);
});

// Purchase product
app.post("/purchase", async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        const product = await Product.findById(productId);
        if (product.quantity < quantity) {
            return res.status(400).json({ error: "Insufficient quantity" });
        }

        const totalAmount = product.price * quantity;
        const order = new Order({ userId, productId, quantity, totalAmount });
        await order.save();
        const amountInCents = Math.round(totalAmount * 100); // Convert to cents

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            customer: (await User.findById(userId)).stripeCustomerId,
            metadata: { orderId: order._id.toString(), userId: userId.toString() },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        // Confirm the payment intent
        // const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);

        // // Check if the payment was successful
        // if (confirmedPaymentIntent.status === 'succeeded') {
        //     // Send notification to the user who made the purchase
        //     await sendNotification([userId], 'Purchase Successful', 'Your purchase was successful!', '/orders', '/path/to/icon.png');
        //     res.status(200).json({ message: 'Purchase processed and notification sent.', clientSecret: paymentIntent.client_secret });
        // } else {
        //     res.status(400).json({ error: 'Payment not successful' });
        // }
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});




//    // Handle the event
//    switch (event.type) {
//     case 'payment_intent.succeeded':
//         const paymentIntent = event.data.object; // Contains a payment intent
//         console.log('PaymentIntent was successful!', paymentIntent);
//         // Perform actions based on the successful payment
//         break;
//     // Handle other event types as needed
//     default:
//         console.log(`Unhandled event type ${event.type}`);
// }