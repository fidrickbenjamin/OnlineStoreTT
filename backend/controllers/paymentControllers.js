import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js";
import Stripe from "stripe";
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

import crypto from "crypto";



/**
 * ============================================================
 * CREATE SHOPDM PAY CHECKOUT
 * ============================================================
 */

export const createShopdmPayCheckout = catchAsyncErrors(
    async (req, res) => {

        const {
            totalAmount,
            orderId,
            reason,
            custom,
        } = req.body;

        // -------------------------------------------------------
        // 1. Validate Order ID
        // -------------------------------------------------------

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required.",
            });
        }

        // -------------------------------------------------------
        // 2. Find the order
        // -------------------------------------------------------

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        // -------------------------------------------------------
        // 3. Make sure this is a ShopDM order
        // -------------------------------------------------------

        if (order.paymentMethod !== "ShopdmPay") {
            return res.status(400).json({
                success: false,
                message:
                    "This order is not configured for ShopDM Pay.",
            });
        }

        // -------------------------------------------------------
        // 4. ALWAYS use the order's database total.
        //
        // Do NOT trust totalAmount sent from the frontend.
        // -------------------------------------------------------

        const orderTotal = Number(order.totalAmount);

        if (
            !Number.isFinite(orderTotal) ||
            orderTotal <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Order does not contain a valid total amount.",
            });
        }

        const totalXcd = orderTotal.toFixed(2);

        // -------------------------------------------------------
        // 5. ShopDM configuration
        // -------------------------------------------------------

        const merchantHandle =
            process.env.SHOPDM_PAY_MERCHANT_HANDLE;

        const sandbox =
            process.env.SHOPDM_PAY_SANDBOX === "true";

        if (
            !merchantHandle ||
            merchantHandle.includes("your-shopdm")
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "ShopDM Pay merchant handle is not configured.",
            });
        }

        // -------------------------------------------------------
        // 6. ShopDM environment URLs
        // -------------------------------------------------------

        const signingApiUrl = sandbox
            ? "https://us-central1-shop-dm-dev.cloudfunctions.net/api/v1/pay/generate-signature"
            : "https://us-central1-shop-dm.cloudfunctions.net/api/v1/pay/generate-signature";

        const paymentBaseUrl = sandbox
            ? "https://pay-dm-dev.web.app"
            : "https://pay.shopdm.store";

        // -------------------------------------------------------
        // 7. Build ShopDM payment parameters
        // -------------------------------------------------------

        const paymentReason =
            reason ||
            `Order ${order._id}`;

        const paymentCustom =
            custom ||
            `orderId ${order._id}`;

        const payload = {
            total_xcd: totalXcd,
            reason: paymentReason,
            invoice_id: String(order._id),
            custom: paymentCustom,
            redirect: true,
            webhook: true,
        };

        // -------------------------------------------------------
        // 8. Generate ShopDM signature
        // -------------------------------------------------------

        let signature;

        try {

            const response = await fetch(
                signingApiUrl,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        payload,
                    }),
                }
            );

            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "ShopDM signature API error:",
                    errorText
                );

                return res.status(502).json({
                    success: false,
                    message:
                        "ShopDM signature generation failed.",
                });
            }

            const signatureResponse =
                await response.json();

            signature =
                signatureResponse?.signature;

            if (!signature) {

                console.error(
                    "ShopDM signature response:",
                    signatureResponse
                );

                return res.status(502).json({
                    success: false,
                    message:
                        "ShopDM did not return a signature.",
                });
            }

        } catch (error) {

            console.error(
                "ShopDM signature request failed:",
                error
            );

            return res.status(502).json({
                success: false,
                message:
                    "Unable to connect to ShopDM Pay.",
            });
        }

        // -------------------------------------------------------
        // 9. Build final payment URL
        // -------------------------------------------------------

        const queryParams =
            new URLSearchParams({
                total_xcd: payload.total_xcd,
                reason: payload.reason,
                invoice_id: payload.invoice_id,
                custom: payload.custom,
                signature,
                redirect: "true",
                webhook: "true",
            });

        const checkoutUrl =
            `${paymentBaseUrl}/${encodeURIComponent(
                merchantHandle
            )}?${queryParams.toString()}`;

        // -------------------------------------------------------
        // 10. Return URL
        // -------------------------------------------------------

        return res.status(200).json({
            success: true,
            sandbox,
            checkoutUrl,
            merchantHandle,
            invoiceId: String(order._id),
            amountXcd: orderTotal,
        });
    }
);


/**
 * ============================================================
 * SHOPDM PAY WEBHOOK
 * ============================================================
 */
export const shopdmPayWebhook = catchAsyncErrors(
    async (req, res) => {

        // -------------------------------------------------------
        // 1. Get signature
        // -------------------------------------------------------

        const signature =
            req.headers["x-shopdm-signature"];

        const webhookSecret =
            process.env.SHOPDM_PAY_WEBHOOK_SECRET;

        if (!webhookSecret) {

            console.error(
                "SHOPDM_PAY_WEBHOOK_SECRET is missing."
            );

            return res.status(500).json({
                success: false,
                message:
                    "ShopDM webhook secret is not configured.",
            });
        }

        if (!signature) {

            console.warn(
                "ShopDM webhook received without signature."
            );

            return res.status(401).json({
                success: false,
                message:
                    "Missing ShopDM webhook signature.",
            });
        }

        // -------------------------------------------------------
        // 2. Verify HMAC-SHA256
        // -------------------------------------------------------

        const payload = req.body;

        const sortedPayload =
            JSON.stringify(
                payload,
                Object.keys(payload).sort()
            );

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    webhookSecret
                )
                .update(
                    sortedPayload,
                    "utf8"
                )
                .digest("hex");

        let signatureIsValid = false;

        try {

            const receivedBuffer =
                Buffer.from(
                    String(signature),
                    "utf8"
                );

            const expectedBuffer =
                Buffer.from(
                    expectedSignature,
                    "utf8"
                );

            if (
                receivedBuffer.length ===
                expectedBuffer.length
            ) {
                signatureIsValid =
                    crypto.timingSafeEqual(
                        receivedBuffer,
                        expectedBuffer
                    );
            }

        } catch (error) {

            console.error(
                "ShopDM signature comparison error:",
                error
            );

            signatureIsValid = false;
        }

        if (!signatureIsValid) {

            console.warn(
                "Invalid ShopDM webhook signature."
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid ShopDM webhook signature.",
            });
        }

        // -------------------------------------------------------
        // 3. Verify event
        // -------------------------------------------------------

        if (
            payload?.event !==
            "payment.success"
        ) {

            return res.status(200).json({
                success: true,
                message:
                    "ShopDM event received but not processed.",
            });
        }

        // -------------------------------------------------------
        // 4. Extract ShopDM information
        // -------------------------------------------------------

        const webhookEventId =
            payload?.id;

        const paymentData =
            payload?.data || {};

        const feeData =
            payload?.fee_data || {};

        const metadata =
            payload?.metadata || {};

        const invoiceId =
            metadata?.invoice_id;

        const transactionId =
            paymentData?.object_id;

        const reference =
            paymentData?.reference;

        const amountXcd =
            Number(paymentData?.amount_xcd);

        // -------------------------------------------------------
        // 5. Validate invoice
        // -------------------------------------------------------

        if (!invoiceId) {

            console.error(
                "ShopDM webhook missing invoice_id.",
                payload
            );

            return res.status(400).json({
                success: false,
                message:
                    "ShopDM webhook is missing invoice_id.",
            });
        }

        // -------------------------------------------------------
        // 6. Validate payment amount
        // -------------------------------------------------------

        if (
            !Number.isFinite(amountXcd) ||
            amountXcd <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid ShopDM payment amount.",
            });
        }

        // -------------------------------------------------------
        // 7. Find the order
        // -------------------------------------------------------

        let order;

        try {

            order =
                await Order.findById(
                    invoiceId
                );

        } catch (error) {

            console.error(
                "Invalid ShopDM invoice ID:",
                invoiceId
            );

            return res.status(400).json({
                success: false,
                message:
                    "Invalid ShopDM invoice/order ID.",
            });
        }

        if (!order) {

            console.error(
                "ShopDM order not found:",
                invoiceId
            );

            return res.status(404).json({
                success: false,
                message:
                    "Order associated with ShopDM payment was not found.",
            });
        }

        // -------------------------------------------------------
        // 8. Verify this is a ShopDM order
        // -------------------------------------------------------

        if (
            order.paymentMethod !==
            "ShopdmPay"
        ) {

            console.error(
                "ShopDM webhook received for non-ShopDM order:",
                order._id
            );

            return res.status(400).json({
                success: false,
                message:
                    "Order is not configured for ShopDM Pay.",
            });
        }

        // -------------------------------------------------------
        // 9. IDEMPOTENCY
        //
        // Your schema does not have isPaid.
        //
        // We therefore use:
        //
        // paymentInfo.status === "paid"
        //
        // -------------------------------------------------------

        if (
            order.paymentInfo?.status ===
            "paid"
        ) {

            return res.status(200).json({
                success: true,
                message:
                    "ShopDM payment was already processed.",
            });
        }

        // -------------------------------------------------------
        // 10. Compare ShopDM amount against YOUR order
        // -------------------------------------------------------

        const expectedAmount =
            Number(order.totalAmount);

        if (
            !Number.isFinite(expectedAmount)
        ) {

            console.error(
                "Order has invalid totalAmount:",
                order._id
            );

            return res.status(500).json({
                success: false,
                message:
                    "Order does not contain a valid total amount.",
            });
        }

        const amountMatches =
            Math.abs(
                expectedAmount -
                amountXcd
            ) < 0.01;

        if (!amountMatches) {

            console.error(
                "ShopDM amount mismatch:",
                {
                    orderId: order._id,
                    expectedAmount,
                    amountReceived:
                        amountXcd,
                }
            );

            return res.status(400).json({
                success: false,
                message:
                    "ShopDM payment amount does not match order total.",
            });
        }

        // -------------------------------------------------------
        // 11. Save ShopDM payment information
        // -------------------------------------------------------

        order.paymentInfo = {

            id:
                transactionId ||
                null,

            status:
                "paid",

            provider:
                "shopdm",

            reference:
                reference ||
                null,

            webhookEventId:
                webhookEventId ||
                null,

            amountXcd:
                amountXcd,

            customerFeeXcd:
                Number(
                    feeData?.customer_fee_xcd ||
                    0
                ),

            merchantFeeXcd:
                Number(
                    feeData?.merchant_fee_xcd ||
                    0
                ),

            netAmountXcd:
                Number(
                    feeData?.net_amount_xcd ||
                    0
                ),

            amountPaidByCustomerXcd:
                Number(
                    feeData?.amount_paid_by_customer_xcd ||
                    0
                ),

            paidAt:
                new Date(),
        };

        // -------------------------------------------------------
        // 12. Save order
        // -------------------------------------------------------

        await order.save();

        // -------------------------------------------------------
        // 13. Log successful payment
        // -------------------------------------------------------

        console.log(
            "ShopDM payment successfully processed.",
            {
                orderId:
                    order._id.toString(),

                transactionId,

                amountXcd,

                webhookEventId,
            }
        );

        // -------------------------------------------------------
        // 14. Respond to ShopDM
        // -------------------------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "ShopDM payment processed successfully.",
        });
    }
);



// Create stripe checkout session => /api/v2/payment/checkout_session

export const stripeCheckoutSession = catchAsyncErrors(
    
    async (req, res, next) => {

        const body = req?.body;

        const line_items = body?.orderItems?.map((item) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item?.name,
                        images: [item?.image],
                        metadata:{ productId: item?.product},                          
                        
                    },
                    unit_amount: item?.price * 100
                },

                tax_rates: ["txr_1PggHtI91zJYVuYG5KkUa7F6"],
                quantity: item?.quantity,
            };
        });

        const shippingInfo = body?.shippingInfo;

        const shipping_rate = body?.itemsPrice >= 200 ? "shr_1Pgg9SI91zJYVuYG0f0koRy1" : "shr_1Pgg9tI91zJYVuYG5rF8TgX1";

        const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                success_url: `${process.env.FRONTEND_URL}/me/orders?order_success=true`,
                cancel_url: `${process.env.FRONTEND_URL}`,
                customer_email: req?.user?.email,
                client_reference_id: req?.user?._id?.toString(),
                mode: "payment",
                metadata: { ...shippingInfo, itemsPrice: body?.itemsPrice },
                shipping_options: [{
                    shipping_rate,
                }],

                line_items,
        });


        

        res.status(200).json({
            url: session.url,
        });
   }

);

 const getOrderItems = async (line_items) => {
    return new Promise((resolve, reject) => {
        let cartItems = [];

        line_items?.data?.forEach(async (item) => {
                const product = await stripe.products.retrieve(item.price.product);
                const productId = product.metadata.productId;

                cartItems.push({
                    product: productId,
                    name: product.name,
                    price: item.price.unit_amount_decimal / 100,
                    quantity: item.quantity,
                    image: product.images[0],
                });

                if(cartItems.length === line_items?.data?.length) {
                    resolve(cartItems)
                }
        });
    });
};

// controllers/paymentControllers.js
export const handlePayPalWebhook = (req, res) => {
  try {
    // PayPal sends events in req.body
    console.log("PayPal webhook received:", req.body);

    // TODO: Verify the webhook with PayPal SDK if needed
    // Then process the event
    res.status(200).send("Webhook received");
  } catch (error) {
    console.error(error);
    res.status(500).send("Webhook error");
  }
};



// Create New Order After payment => /api/v2/payment/webhook
export const stripeWebhook = catchAsyncErrors(
    
    async (req, res, next) => {
        try {
            const signature = req.headers["stripe-signature"];
            const event = stripe.webhooks.constructEvent(req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);


            if(event.type === "checkout.session.completed") {
                const session = event.data.object;

                const line_items = await stripe.checkout.sessions.listLineItems(session.id);

                const orderItems = await getOrderItems(line_items);
                const user = session.client_reference_id;

                const totalAmount = session.amount_total / 100;
                const taxAmount = session.total_details.amount_tax / 100;
                const shippingAmount = session.total_details.amount_shipping / 100;
                const itemsPrice = session.metadata.itemsPrice;

                const shippingInfo = {
                    address: session.metadata.address,
                    city: session.metadata.city,
                    phoneNo: session.metadata.phoneNo,
                    zipCode: session.metadata.zipCode,
                    country: session.metadata.country,
                };
                
                const paymentInfo = {
                    id: session.payment_intent,
                    status: session.payment_status,
                };

                const orderData = {
                    shippingInfo,
                    orderItems,
                    itemsPrice,
                    taxAmount,
                    shippingAmount,
                    totalAmount,
                    paymentInfo,
                    paymentMethod: "Card",
                    user,
                };

                await Order.create(orderData);

                

                res.status(200).json ({ success: true });
            }



        } catch (error) {
            console.log("================");
            console.log("Error=>", error);
            console.log("================");
        }

    });
