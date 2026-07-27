import express from "express";
import { processFiservPayment } from "../controllers/fiservController.js";
const router = express.Router();

import { isAuthenticatedUser} from "../middlewares/auth.js";
import {
  stripeCheckoutSession,
  stripeWebhook,
  handlePayPalWebhook,
  createShopdmPayCheckout,
  shopdmPayWebhook,
} from "../controllers/paymentControllers.js";

router.route("/payment/checkout_session").post(isAuthenticatedUser, stripeCheckoutSession);
router.route("/payment/webhook").post(stripeWebhook);
router.route("/payment/shopdm-checkout").post(isAuthenticatedUser, createShopdmPayCheckout);
router.route("/payment/shopdm-webhook").post(shopdmPayWebhook);

// POST /api/v2/payment/fiserv
router.route("/payment/fiserv").post(isAuthenticatedUser, processFiservPayment);

// PayPal webhook route
router.route("/payment/paypal-webhook").post(handlePayPalWebhook); // ← New route

export default router;