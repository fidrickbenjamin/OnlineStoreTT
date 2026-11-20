import {limit} from '../hubs/limits.js';
import {startGuard} from '../services/paymentGateways.js';
import express from "express";
import { processFiservPayment } from "../controllers/fiservController.js";
import { createPayPalOrder, capturePayPalOrder, handlePayPalWebhook, checkPayPalPayment } from "../controllers/paypalController.js";
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
router.route("/payment/shopdm-checkout").post(isAuthenticatedUser, startGuard('ShopdmPay'), paymentReadiness, createShopdmPayCheckout);
router.route("/payment/shopdm-webhook").post(shopdmPayWebhook);

// POST /api/v2/payment/fiserv
router.route("/payment/fiserv").post(isAuthenticatedUser, processFiservPayment);

router.route("/payment/paypal/create-order").post(isAuthenticatedUser, limit('retail-paypal-create',12,60000), startGuard('PayPal'), paymentReadiness, createPayPalOrder);
router.route("/payment/paypal/capture/:orderId").post(isAuthenticatedUser, limit('retail-paypal-capture',12,60000), capturePayPalOrder);
router.route("/payment/paypal/status/:orderId").post(isAuthenticatedUser, limit('retail-paypal-status',30,60000), checkPayPalPayment);
router.route("/payment/paypal-webhook").post(handlePayPalWebhook);

export default router;
