import express from "express";
import { processFiservPayment } from "../controllers/fiservController.js";
import { createPayPalOrder, capturePayPalOrder, handlePayPalWebhook } from "../controllers/paypalController.js";
import paymentReadiness from "../middlewares/paymentReadiness.js";
const router = express.Router();

import { isAuthenticatedUser} from "../middlewares/auth.js";
import {
  stripeCheckoutSession,
  stripeWebhook,
  createShopdmPayCheckout,
  shopdmPayWebhook,
} from "../controllers/paymentControllers.js";

router.route("/payment/checkout_session").post(isAuthenticatedUser, stripeCheckoutSession);
router.route("/payment/webhook").post(stripeWebhook);
router.route("/payment/shopdm-checkout").post(isAuthenticatedUser, paymentReadiness, createShopdmPayCheckout);
router.route("/payment/shopdm-webhook").post(shopdmPayWebhook);

// POST /api/v2/payment/fiserv
router.route("/payment/fiserv").post(isAuthenticatedUser, processFiservPayment);

router.route("/payment/paypal/create-order").post(isAuthenticatedUser, paymentReadiness, createPayPalOrder);
router.route("/payment/paypal/capture/:orderId").post(isAuthenticatedUser, paymentReadiness, capturePayPalOrder);
router.route("/payment/paypal-webhook").post(handlePayPalWebhook);

export default router;
