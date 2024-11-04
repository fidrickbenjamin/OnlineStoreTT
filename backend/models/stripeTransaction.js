import mongoose from "mongoose";

const stripeTransactionSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
        required: true,
    },
    stripeID: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model("StripeTransaction", stripeTransactionSchema);