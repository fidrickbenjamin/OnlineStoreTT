export const handlePayPalWebhook = async (req, res) => {
  const event = req.body; // PayPal sends JSON

  try {
    console.log("PayPal webhook event received:", event);

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = event.resource.supplementary_data?.related_ids?.order_id || null;
      if (orderId) {
        // TODO: update your order status in DB
        console.log(`Payment completed for order ${orderId}`);
      }
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error handling PayPal webhook:", error);
    res.status(500).send("Error processing webhook");
  }
};