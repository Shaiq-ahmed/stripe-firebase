const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    stripeCustomerId: { type: String, required: true },
    fcmToken: { type: String }, 
});

const User = mongoose.model("User", userSchema);

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    url: { type: String }, // URL for navigation
    icon: { type: String }, // Icon for the notification
    createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);



// Card Schema (optional, as cards are usually managed by Stripe)
const cardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stripeCardId: { type: String, required: true },
});

const Card = mongoose.model("Card", cardSchema);

// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

const Product = mongoose.model("Product", productSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "pending" },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = { User, Card, Product, Order, Notification };