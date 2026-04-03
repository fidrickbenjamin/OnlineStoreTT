import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import axios from "axios";
import order from "../models/order.js";

/**
 * Process Fiserv Payment
 * POST /api/v2/payment/fiserv
 */
export const processFiservPayment = catchAsyncErrors(async (req, res) => {
    const { cardNumber, expiry, cvv, amount, orderItems, shippingInfo, userId } = req.body;

    if (!cardNumber || !expiry || !cvv || !amount) {
        return res.status(400).json({ error: "All payment fields are required" });
    }

    try {
        // Call Fiserv API
        const response = await axios.post(
            "https://api.fiserv.com/payments", // replace with actual endpoint
            { cardNumber, expiry, cvv, amount },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.FISERV_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // If payment is successful, save the order
        if (response.data?.status === "success") {
            const totalAmount = amount;
            const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const taxAmount = 0; // adjust if needed
            const shippingAmount = 0; // adjust if needed

            const orderData = {
                shippingInfo,
                orderItems,
                itemsPrice,
                taxAmount,
                shippingAmount,
                totalAmount,
                paymentInfo: {
                    id: response.data.transactionId,
                    status: "success",
                },
                paymentMethod: "Card",
                user: userId,
            };

            await order.create(orderData);

            res.status(200).json({ success: true, orderData });
        } else {
            res.status(400).json({ success: false, message: "Payment failed", data: response.data });
        }
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Payment failed" });
    }
});