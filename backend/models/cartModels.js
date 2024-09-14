// backend/models/cartModel.js

import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        phoneNo: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
    },
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
