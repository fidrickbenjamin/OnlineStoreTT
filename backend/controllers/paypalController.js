import {assertGateway} from '../services/paymentGateways.js';
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js";

import {paypalRequest} from '../utils/paypalApi.js';
import {hubPayPalEvent} from '../hubs/payments.js';

import {beginPayment,capturePayment,paymentStatus,paymentEvent} from '../services/paypalCheckout.js';
export const createPayPalOrder = catchAsyncErrors(async(req,res)=>{
 await assertGateway('PayPal',{credentials:true});
 res.json({success:true,...await beginPayment('retail',req.body.orderId,req.user._id)});
});
export const capturePayPalOrder = catchAsyncErrors(async(req,res)=>{
 res.json({success:true,...await capturePayment('retail',req.params.orderId,req.user._id,req.body.paypalOrderId)});
});
export const checkPayPalPayment = catchAsyncErrors(async(req,res)=>{
 res.json(await paymentStatus('retail',req.params.orderId,req.user._id));
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
  if(await paymentEvent(event)) return res.sendStatus(200);
  // Previously-created main-store checkouts used an unconverted amount. Never
  // fulfil them automatically. Preserve historical paid records for review.
  const reference=event.resource?.supplementary_data?.related_ids?.order_id;
  if(reference){
   await Order.updateOne({paymentMethod:'PayPal','paymentInfo.reference':reference,'paymentInfo.status':{$nin:['Paid','Refunded','Verifying']}},{$set:{'paymentInfo.status':'Verifying'},$push:{timeline:{message:'Older PayPal transaction received. Verify XCD/USD amount and actual funds before fulfilment.',createdAt:new Date()}}});
  }
  if(await hubPayPalEvent(event)) return res.sendStatus(200);
  res.sendStatus(200);
});
