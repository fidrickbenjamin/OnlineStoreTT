import {retailSnapshot} from '../commercial/controllers.js';
import {activeOptions} from '../services/marketplaceDelivery.js';
import {checkoutContacts} from "../utils/accountRules.js";
import {quoteCart} from "../services/promotionPricing.js";
import crypto from "node:crypto";
import { orderDeletion } from "../utils/orderDeletion.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";
import { notifyOrder } from "../services/orderNotifications.js";
import { withOrderLock, ensureReserved, releaseOrder, expireOrders } from "../services/orderInventory.js";
import { groupItems, calculateTotals, checkoutFingerprint, deliveryOptions, methods, statuses, paymentStatuses, validateTransition, parseDateRange, decodeProof } from "../utils/orderRules.js";
const online = method => ["PayPal", "ShopdmPay", "Card"].includes(method);
const owns = (order, user) => String(order.user?._id || order.user) === String(user._id) || user.role === "admin";
async function visibleOrder(req, includeProof = false) {
  let query = Order.findById(req.params.id);
  if (includeProof) query = query.select("+paymentProof.data");
  const order = await query;
  if (!order || !owns(order, req.user)) throw new ErrorHandler("Order not found", 404);
  return order;
}
function publicOrder(order, admin = false) {
  const data = order.toObject();
  delete data.commercial; delete data.inventoryLock; delete data.dedupeKey;
  if (data.paymentProof) delete data.paymentProof.data;
  if (!admin) delete data.internalNotes;
  data.delivery = data.deliverySnapshot || deliveryOptions[data.shippingOption];
  data.orderNumber = `TT-${String(data._id).slice(-8).toUpperCase()}`;
  data.deletion = orderDeletion(order, admin);
  return data;
}
async function announce(order, subject) {
  try { return await notifyOrder(order, subject); }
  catch (error) { console.error("Order notification failed:", error.message); return false; }
}
export const newOrder = catchAsyncErrors(async (req, res) => {
  await Order.init();
  await expireOrders();
  const { shippingOption, paymentMethod } = req.body;
  let contacts;try{contacts=checkoutContacts(req.user,req.body);}catch(error){throw new ErrorHandler(error.message,400);}
  const {shippingInfo,buyerInfo}=contacts;
  if (!methods.includes(paymentMethod) || !Object.hasOwn(await activeOptions(),shippingOption)) throw new ErrorHandler("Choose a supported payment and delivery method.", 400);
  for (const key of ["address", "city", "phoneNo", "zipCode", "country"]) if (!String(shippingInfo[key] || "").trim() || String(shippingInfo[key]).length > 250) throw new ErrorHandler("Complete shipping information is required.", 400);
  let grouped;
  try { grouped = groupItems(req.body.orderItems); } catch (error) { throw new ErrorHandler(error.message, 400); }
  const dedupeKey = checkoutFingerprint(req.user._id, grouped, shippingInfo, shippingOption, paymentMethod);
  const legacyKey=checkoutFingerprint(req.user._id,grouped,req.body.shippingInfo||{},shippingOption,paymentMethod);
  const keys=[...new Set([dedupeKey,legacyKey])];
  await Order.updateMany({ dedupeKey:{$in:keys}, $or: [{ "paymentInfo.status": { $in: ["Paid", "Refunded"] } }, { orderStatus: "Cancelled" }] }, { $unset: { dedupeKey: 1 } });
  let order = await Order.findOne({ dedupeKey:{$in:keys} });
  let reused = Boolean(order);
  if (!order) {
    const quote = await quoteCart(grouped,shippingOption,req.user._id,shippingInfo.city);
    if(req.body.quoteHash!==quote.quoteHash)return res.status(409).json({success:false,code:"PRICE_CHANGED",message:"Prices or offers changed, or your checkout needs reviewing. Return to Confirm Order to check the current total before paying."});
    const {orderItems:verified,totalSavings,...totals}=quote;
    delete totals.quoteHash;delete totals.quotedAt;
    try {
      order = await Order.create({ commercial:await retailSnapshot(verified), orderItems: verified, shippingInfo, shippingOption, ...totals, totalSavings, buyerInfo, user: req.user._id, paymentMethod, paymentInfo: { status: paymentMethod === "NBD" ? "Verifying" : online(paymentMethod) ? "Pending" : "Not Paid", provider: online(paymentMethod) ? paymentMethod : undefined }, orderStatus: "Pending", inventoryTracked: true, dedupeKey, expiresAt: new Date(Date.now()+86400000), timeline: [{ message: "Order received. Awaiting payment or store confirmation." }] });
    } catch (error) { if (error.code !== 11000) throw error; order = await Order.findOne({ dedupeKey }); reused = true; }
  }
  if (!order) throw new ErrorHandler("Checkout is being created. Please retry shortly.", 409);
  order = await withOrderLock(order._id, async locked => {
    try { await ensureReserved(locked); return locked; }
    catch (error) {
      locked.orderStatus = "Cancelled"; locked.dedupeKey = undefined;
      locked.timeline.push({ message: "Order could not reserve sufficient stock." }); await locked.save(); throw error;
    }
  });
  const emailSent = reused ? undefined : await announce(order, "Order received");
  res.status(200).json({ success: true, order: publicOrder(order), reused, emailSent });
});
export const myOrders = catchAsyncErrors(async (req, res) => {
  await expireOrders();
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders: orders.map(order => publicOrder(order)) });
});
export const getOrderDetails = catchAsyncErrors(async (req, res) => {
  await expireOrders();
  const order = await visibleOrder(req);
  await order.populate("user", "name email");
  res.json({ success: true, order: publicOrder(order, req.user.role === "admin") });
});
export const allOrders = catchAsyncErrors(async (req, res) => {
  await expireOrders();
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json({ success: true, orders: orders.map(order => publicOrder(order, true)) });
});
export const updateOrder = catchAsyncErrors(async (req, res) => {
  const body = req.body;
  const order = await withOrderLock(req.params.id, async order => {
    const targetStatus = body.status || order.orderStatus;
    const targetPayment = body.paymentStatus || order.paymentInfo?.status;
    if (!statuses.includes(targetStatus) || !validateTransition(order.orderStatus, targetStatus)) throw new ErrorHandler("Invalid fulfilment status transition.", 400);
    if (!paymentStatuses.includes(targetPayment)) throw new ErrorHandler("Invalid payment status.", 400);
    if (body.paymentMethod && body.paymentMethod !== order.paymentMethod) throw new ErrorHandler("Payment method cannot be changed on an existing order. Create a new order if needed.", 400);
    if (online(order.paymentMethod) && targetPayment !== order.paymentInfo?.status) throw new ErrorHandler("Online payment status must come from its payment provider.", 400);
    if (["Paid", "Refunded"].includes(order.paymentInfo?.status) && ![order.paymentInfo.status, "Refunded"].includes(targetPayment)) throw new ErrorHandler("A confirmed payment cannot be reset to unpaid.", 400);
    if (body.note !== undefined && (typeof body.note !== "string" || body.note.length > 2000)) throw new ErrorHandler("Notes must be at most 2,000 characters.", 400);
    if (["Shipped", "Delivered"].includes(targetStatus) && targetPayment !== "Paid") throw new ErrorHandler("Confirm payment before shipping or marking delivery complete.", 409);
    if (targetPayment === "Refunded" && !["Paid", "Refunded"].includes(order.paymentInfo?.status)) throw new ErrorHandler("Only a paid order can be marked refunded.", 409);
    if (order.paymentMethod === "NBD" && order.paymentProof?.reviewStatus === "Pending" && targetPayment === "Paid" && order.paymentInfo?.status !== "Paid") throw new ErrorHandler("Approve the submitted receipt using its review controls.", 409);
    if (body.stockAction && !order.inventoryTracked) {
      if (!["deduct", "alreadyDeducted"].includes(body.stockAction)) throw new ErrorHandler("Invalid stock reconciliation choice.", 400);
      order.inventoryTracked = true;
      if (body.stockAction === "alreadyDeducted") {
        // Add the ledger without decrementing historical stock a second time.
        for (const item of order.orderItems) {
          const result = await Product.updateOne({ _id: item.product, "inventoryAllocations.order": { $ne: order._id } }, { $push: { inventoryAllocations: { order: order._id, quantity: item.quantity } } });
          if (!result.matchedCount && !await Product.exists({ _id: item.product })) throw new ErrorHandler("A legacy product was deleted; reconcile inventory manually first.", 409);
        }
        order.inventoryState = "Reserved";
      }
      order.timeline.push({ message: "Store reconciled stock accounting for this legacy order." });
    }
    if (targetStatus === "Cancelled" && order.orderStatus !== "Cancelled") {
      if (online(order.paymentMethod) && !body.providerReconciled) throw new ErrorHandler("Check the payment provider for completed/in-flight payments before cancelling, then confirm reconciliation.", 409);
      if (!order.inventoryTracked) throw new ErrorHandler("Reconcile this legacy order's inventory before cancelling.", 409);
      await releaseOrder(order); order.dedupeKey = undefined;
    } else if (["Processing", "Shipped", "Delivered"].includes(targetStatus) && order.inventoryTracked) await ensureReserved(order);
    else if (!order.inventoryTracked && targetStatus !== order.orderStatus) throw new ErrorHandler("Choose how this legacy order's stock was handled first.", 409);
    if (targetStatus !== order.orderStatus) order.timeline.push({ message: `Fulfilment changed to ${targetStatus}.` });
    if (targetPayment !== order.paymentInfo?.status) {
      order.timeline.push({ message: `Payment changed to ${targetPayment}.` });
      if (targetPayment === "Paid") { order.paymentInfo.paidAt = new Date(); if(['CASH','COD'].includes(order.paymentMethod))order.paymentInfo.paidCashHolder='admin'; order.expiresAt = undefined; order.dedupeKey = undefined; }
    }
    if(targetPayment==='Refunded'&&order.paymentInfo.status!=='Refunded'){order.paymentInfo.refundedAt=new Date();if(req.body.refundMethod&&!['cash','bank','provider'].includes(req.body.refundMethod))throw new ErrorHandler('Choose the actual refund method.',400);order.paymentInfo.refundMethod=req.body.refundMethod||undefined;}
    order.orderStatus = targetStatus; order.paymentInfo.status = targetPayment;
    if (targetStatus === "Delivered" && !order.deliveredAt) order.deliveredAt = new Date();
    if (body.note?.trim()) order.internalNotes.push({ text: body.note.trim(), author: req.user.name || "Admin" });
    if (typeof body.archived === "boolean") order.archived = body.archived;
    await order.save(); return order;
  });
  const emailSent = (body.status || body.paymentStatus) ? await announce(order, "Order status updated") : undefined;
  res.json({ success: true, order: publicOrder(order, true), emailSent });
});
export const deleteOrder = catchAsyncErrors(async (req, res) => {
  await visibleOrder(req);
  await withOrderLock(req.params.id, async order => {
    // Recheck permissions and payment state after taking the same lock used
    // by checkout, receipt review and fulfilment updates.
    if (!owns(order, req.user)) throw new ErrorHandler("Order not found", 404);
    const deletion = orderDeletion(order, req.user.role === "admin");
    if (!deletion.allowed) throw new ErrorHandler(deletion.reason, 409);
    // Persist cancellation first so an interrupted release remains retryable
    // and cannot reopen payment. Product allocation release is idempotent.
    order.orderStatus = "Cancelled";
    order.dedupeKey = undefined;
    await order.save();
    await releaseOrder(order);
    await Order.deleteOne({ _id: order._id, "inventoryLock.token": order.inventoryLock.token });
  });
  res.json({ success: true, message: "Unpaid order deleted. Reserved stock has been returned." });
});
export const cancelOrder = catchAsyncErrors(async (req, res) => {
  await visibleOrder(req);
  const order = await withOrderLock(req.params.id, async order => {
    if (["Shipped", "Delivered", "Cancelled"].includes(order.orderStatus)) throw new ErrorHandler("This order can no longer be cancelled online.", 409);
    if (!order.cancelRequestedAt) { order.cancelRequestedAt = new Date(); order.timeline.push({ message: "Customer requested cancellation. Awaiting store review." }); }
    await order.save(); return order;
  });
  await announce(order, "Cancellation requested");
  res.json({ success: true, message: "Cancellation requested. The store will confirm stock release and any refund separately." });
});
export const uploadPaymentProof = catchAsyncErrors(async (req, res) => {
  await visibleOrder(req);
  let proof;
  try { proof = decodeProof(req.body.image); } catch (error) { throw new ErrorHandler(error.message, 400); }
  const order = await withOrderLock(req.params.id, async order => {
    if (order.paymentMethod !== "NBD" || ["Paid", "Refunded"].includes(order.paymentInfo?.status) || order.orderStatus === "Cancelled") throw new ErrorHandler("This order cannot accept a Mobanking receipt.", 409);
    order.paymentProof = { ...proof, proofId: crypto.randomUUID(), uploadedAt: new Date(), reference: String(req.body.reference || "").slice(0,120), reviewStatus: "Pending" };
    order.paymentInfo.status = "Verifying";
    order.timeline.push({ message: "Mobanking receipt submitted for review." });
    await order.save(); return order;
  });
  await announce(order, "Mobanking receipt awaiting review");
  res.json({ success: true });
});
export const getPaymentProof = catchAsyncErrors(async (req, res) => {
  const order = await visibleOrder(req, true);
  if (!order.paymentProof?.data) throw new ErrorHandler("Receipt not found", 404);
  res.set({ "Content-Type": order.paymentProof.mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" }).send(order.paymentProof.data);
});
export const reviewPaymentProof = catchAsyncErrors(async (req, res) => {
  const order = await withOrderLock(req.params.id, async order => {
    if (order.paymentMethod !== "NBD" || !order.paymentProof?.proofId || order.paymentProof.proofId !== req.body.proofId || order.paymentProof.reviewStatus !== "Pending" || order.orderStatus === "Cancelled" || order.paymentInfo?.status === "Paid") throw new ErrorHandler("This receipt changed or has already been reviewed. Refresh the order.", 409);
    if (!["Approved", "Rejected"].includes(req.body.decision)) throw new ErrorHandler("Choose approve or reject.", 400);
    const reason = String(req.body.reason || "").trim().slice(0,500);
    if (req.body.decision === "Rejected" && !reason) throw new ErrorHandler("Give a reason so the customer can correct the receipt.", 400);
    if (req.body.decision === "Approved") { await ensureReserved(order); order.paymentInfo.status = "Paid"; order.paymentInfo.paidAt = new Date(); if(['CASH','COD'].includes(order.paymentMethod))order.paymentInfo.paidCashHolder='admin'; order.expiresAt = undefined; order.dedupeKey = undefined; if (order.orderStatus === "Pending") order.orderStatus = "Processing"; }
    else order.paymentInfo.status = "Failed";
    Object.assign(order.paymentProof, { reviewStatus: req.body.decision, reviewReason: reason, reviewedAt: new Date(), reviewedBy: req.user.name || "Admin" });
    order.timeline.push({ message: `Mobanking receipt ${req.body.decision.toLowerCase()}${reason ? `: ${reason}` : "."}` });
    await order.save(); return order;
  });
  await announce(order, "Mobanking receipt reviewed");
  res.json({ success: true });
});
export const deliverySettings = catchAsyncErrors(async (req, res) => res.json({ success: true, options: await activeOptions() }));
export const getSales = catchAsyncErrors(async (req, res) => {
  let range; try { range = parseDateRange(req.query.startDate, req.query.endDate); } catch (error) { throw new ErrorHandler(error.message, 400); }
  const { startDate, endDate } = range;
  const paidDate = { $ifNull: ["$paymentInfo.paidAt", "$createdAt"] };
  const paid = { "paymentInfo.status": "Paid", $expr: { $and: [{ $gte: [paidDate,startDate] }, { $lte: [paidDate,endDate] }] } };
  const [daily, bestSellers, statusesData, paymentData] = await Promise.all([
    Order.aggregate([{ $match: paid }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: paidDate, timezone: "America/Dominica" } }, sales: { $sum: "$totalAmount" }, numOrders: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Order.aggregate([{ $match: paid }, { $unwind: "$orderItems" }, { $group: { _id: "$orderItems.product", name: { $first: "$orderItems.name" }, units: { $sum: "$orderItems.quantity" }, revenue: { $sum: { $multiply: [{ $convert: { input: "$orderItems.price", to: "double", onError: 0, onNull: 0 } }, "$orderItems.quantity"] } } } }, { $sort: { revenue: -1 } }, { $limit: 10 }]),
    Order.aggregate([{ $match: { createdAt: { $gte: startDate, $lte: endDate } } }, { $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: startDate, $lte: endDate } } }, { $group: { _id: "$paymentInfo.status", count: { $sum: 1 }, amount: { $sum: "$totalAmount" } } }]),
  ]);
  const totalSales = daily.reduce((sum,row)=>sum+row.sales,0), totalNumOrders = daily.reduce((sum,row)=>sum+row.numOrders,0);
  res.json({ success: true, totalSales, totalNumOrders, sales: daily.map(row=>({date:row._id,sales:row.sales,numOrders:row.numOrders})), bestSellers, statuses: statusesData, payments: paymentData, averageOrderValue: totalNumOrders ? totalSales/totalNumOrders : 0 });
});

export const quoteOrder = catchAsyncErrors(async(req,res)=>{
 const quote=await quoteCart(req.body.orderItems,req.body.shippingOption,req.user._id,req.body.community);
 res.set("Cache-Control","no-store").json({success:true,quote});
});
