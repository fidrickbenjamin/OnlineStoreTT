import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/order.js";

const paypalBase = () => process.env.PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) throw new Error("PayPal server credentials are not configured");
  const response = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("Could not authenticate with PayPal");
  return data.access_token;
}

async function paypalRequest(path, { method = "GET", body, requestId } = {}) {
  const token = await getAccessToken();
  const response = await fetch(`${paypalBase()}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(requestId ? { "PayPal-Request-Id": requestId } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "PayPal request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export const createPayPalOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) return next(new ErrorHandler("Order not found", 404));
  if (order.paymentMethod !== "PayPal") return next(new ErrorHandler("This order is not a PayPal order", 400));
  if (order.paymentInfo?.status === "Paid") return next(new ErrorHandler("This order has already been paid", 409));
  const currency = process.env.PAYPAL_CURRENCY || "USD";
  const amount = Number(order.totalAmount).toFixed(2);
  const created = await paypalRequest("/v2/checkout/orders", {
    method: "POST",
    requestId: `create-${order._id}`,
    body: {
      intent: "CAPTURE",
      purchase_units: [{ reference_id: String(order._id), custom_id: String(order._id), invoice_id: `TT-${order._id}`, amount: { currency_code: currency, value: amount, breakdown: { item_total: { currency_code: currency, value: Number(order.itemsPrice).toFixed(2) }, tax_total: { currency_code: currency, value: Number(order.taxAmount).toFixed(2) }, shipping: { currency_code: currency, value: Number(order.shippingAmount).toFixed(2) } } } }],
      application_context: { brand_name: "Tactical Trends Market Place", user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING" },
    },
  });
  order.paymentInfo = { status: "Pending", provider: "PayPal", reference: created.id, amountXcd: Number(amount) };
  await order.save();
  res.status(200).json({ success: true, id: created.id });
});

export const capturePayPalOrder = catchAsyncErrors(async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) return next(new ErrorHandler("Order not found", 404));
  if (order.paymentMethod !== "PayPal") return next(new ErrorHandler("This order is not a PayPal order", 400));
  if (order.paymentInfo?.status === "Paid") return res.status(200).json({ success: true, alreadyPaid: true });
  if (!order.paymentInfo?.reference || order.paymentInfo.reference !== req.body.paypalOrderId) return next(new ErrorHandler("PayPal order does not match this checkout", 400));
  const captured = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(req.body.paypalOrderId)}/capture`, { method: "POST", requestId: `capture-${order._id}` });
  const unit = captured.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const currency = process.env.PAYPAL_CURRENCY || "USD";
  if (captured.status !== "COMPLETED" || unit?.custom_id !== String(order._id) || capture?.status !== "COMPLETED" || capture?.amount?.currency_code !== currency || Number(capture?.amount?.value) !== Number(order.totalAmount)) {
    return next(new ErrorHandler("PayPal did not confirm the expected completed payment", 402));
  }
  order.paymentInfo = { status: "Paid", provider: "PayPal", id: capture.id, reference: captured.id, amountPaidByCustomerXcd: Number(capture.amount.value), paidAt: new Date() };
  order.orderStatus = "Processing";
  await order.save();
  res.status(200).json({ success: true, orderId: order._id });
});

export const handlePayPalWebhook = catchAsyncErrors(async (req, res) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return res.status(503).json({ success: false, message: "PayPal webhook is not configured" });
  const verification = await paypalRequest("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: {
      auth_algo: req.get("paypal-auth-algo"),
      cert_url: req.get("paypal-cert-url"),
      transmission_id: req.get("paypal-transmission-id"),
      transmission_sig: req.get("paypal-transmission-sig"),
      transmission_time: req.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: req.body,
    },
  });
  if (verification.verification_status !== "SUCCESS") return res.status(400).json({ success: false, message: "Invalid PayPal webhook signature" });
  const event = req.body;
  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
    const order = paypalOrderId ? await Order.findOne({ "paymentInfo.reference": paypalOrderId, paymentMethod: "PayPal" }) : null;
    if (order && order.paymentInfo.status !== "Paid") {
      const amount = event.resource?.amount;
      if (amount?.currency_code === (process.env.PAYPAL_CURRENCY || "USD") && Number(amount.value) === Number(order.totalAmount)) {
        order.paymentInfo.status = "Paid";
        order.paymentInfo.id = event.resource.id;
        order.paymentInfo.amountPaidByCustomerXcd = Number(amount.value);
        order.paymentInfo.paidAt = event.create_time ? new Date(event.create_time) : new Date();
        order.orderStatus = "Processing";
        await order.save();
      }
    }
  } else if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
    await Order.updateOne({ "paymentInfo.id": event.resource?.id, paymentMethod: "PayPal" }, { $set: { "paymentInfo.status": "Refunded" } });
  }
  res.sendStatus(200);
});
