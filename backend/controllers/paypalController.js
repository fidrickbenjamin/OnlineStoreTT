export const handlePayPalWebhook = async (req, res) => {
  const event = req.body;

  try {
    console.log("PayPal webhook event received:", event.event_type);

    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        const orderId = event.resource.supplementary_data?.related_ids?.order_id;
        if (orderId) {
          // Update your order status in DB
          console.log(`Payment completed for order ${orderId}`);
        }
        break;

      case "PAYMENT.CAPTURE.DENIED":
        console.log("Payment denied:", event.resource.id);
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        console.log("Payment refunded:", event.resource.id);
        break;

      // You can add other cases if you want, but no action is required for unused events
      default:
        console.log(`Event ${event.event_type} received but ignored.`);
    }

    // Always respond 200 OK to PayPal
    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error handling PayPal webhook:", error);
    // Even on error, respond 200 to avoid PayPal retrying too aggressively
    res.status(200).send("Webhook received with error");
  }
};