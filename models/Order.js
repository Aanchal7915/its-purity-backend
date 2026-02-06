const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Snapshot of price at time of order
        name: { type: String }, // Snapshot of product name
        image: { type: String } // Snapshot of product image
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        phone: String
    },
    status: {
        type: String,
        enum: ['Processing', 'Out for delivery', 'Delivered', 'Cancelled', 'Returned', 'Replaced'],
        default: 'Processing'
    },
    timeline: [{
        status: String,
        date: { type: Date, default: Date.now }
    }],
    adminNotes: { type: String }, // Private notes for admin
    userNotes: { type: String }, // Notes from usage at checkout
    paymentMethod: { type: String, required: true, default: 'COD' },
    isPaid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
