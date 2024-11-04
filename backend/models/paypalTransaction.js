import mongoose from "mongoose";

const paypalTransactionSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
        required: true,
    },
    paypalID: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.model("PaypalTransaction", paypalTransactionSchema);