import crypto from "node:crypto";
import Order from "../models/order.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";

// Each decrement is conditional on BOTH available stock and absence of this
// order's allocation. Compensation uses the stored allocation, not client data.
export async function reserveProducts(order) {
  for (const item of order.orderItems) {
    const exists = await Product.exists({ _id: item.product, "inventoryAllocations.order": order._id });
    if (exists) continue;
    const result = await Product.updateOne({ _id: item.product, stock: { $gte: item.quantity }, "inventoryAllocations.order": { $ne: order._id } }, { $inc: { stock: -item.quantity }, $push: { inventoryAllocations: { order: order._id, quantity: item.quantity } } });
    if (!result.modifiedCount && !await Product.exists({ _id: item.product, "inventoryAllocations.order": order._id })) throw new ErrorHandler(`${item.name} no longer has enough stock.`, 409);
  }
}
export async function releaseProducts(order) {
  for (const item of order.orderItems) {
    const product = await Product.findOne({ _id: item.product, "inventoryAllocations.order": order._id }).select("+inventoryAllocations");
    const allocation = product?.inventoryAllocations.find(row => String(row.order) === String(order._id));
    if (allocation) await Product.updateOne({ _id: item.product, "inventoryAllocations.order": order._id }, { $inc: { stock: allocation.quantity }, $pull: { inventoryAllocations: { order: order._id } } });
  }
}
export async function withOrderLock(id, task) {
  const token = crypto.randomUUID(), now = new Date();
  const order = await Order.findOneAndUpdate({ _id: id, $or: [{ "inventoryLock.until": { $exists: false } }, { "inventoryLock.until": { $lt: now } }] }, { $set: { inventoryLock: { token, until: new Date(+now + 120000) } } }, { new: true });
  if (!order) throw new ErrorHandler("This order is being updated. Please retry shortly.", 409);
  try { return await task(order); }
  finally { await Order.updateOne({ _id: id, "inventoryLock.token": token }, { $unset: { inventoryLock: 1 } }); }
}
export async function ensureReserved(order) {
  if (!order.inventoryTracked) throw new ErrorHandler("This is a legacy order. An administrator must confirm its stock accounting before payment or fulfilment.", 409);
  if (order.inventoryState === "Released") throw new ErrorHandler("This order's stock has been released. Please contact the store.", 409);
  if (order.inventoryState === "Reserved") {
    for (const item of order.orderItems) if (!await Product.exists({ _id: item.product, "inventoryAllocations.order": order._id })) throw new ErrorHandler("Reserved inventory is missing; contact the store before payment.", 409);
    return;
  }
  try {
    await reserveProducts(order);
    order.inventoryState = "Reserved";
    await order.save();
  } catch (error) {
    await releaseProducts(order);
    throw error;
  }
}
export async function releaseOrder(order) {
  if (order.inventoryTracked) await releaseProducts(order);
  order.inventoryState = "Released";
}
export async function expireOrders() {
  const candidates = await Order.find({ inventoryTracked: true, expiresAt: { $lt: new Date() }, orderStatus: "Pending",  $or: [{ "paymentInfo.status": { $in: ["Pending", "Not Paid", "Failed"] } }, { "paymentInfo.status": "Verifying", "paymentProof.uploadedAt": { $exists: false } }] }).limit(50).select("_id");
  for (const candidate of candidates) {
    try {
      await withOrderLock(candidate._id, async order => {
        if (order.orderStatus !== "Pending" || (["Paid", "Refunded"].includes(order.paymentInfo?.status) || (order.paymentInfo?.status === "Verifying" && order.paymentProof?.uploadedAt)) || !order.expiresAt || +order.expiresAt > Date.now()) return;
        await releaseOrder(order);
        order.orderStatus = "Cancelled"; order.dedupeKey = undefined;
        order.timeline.push({ message: "Unpaid order expired; reserved stock was released." });
        await order.save();
      });
    } catch (error) { if (error.statusCode !== 409) console.error("Order expiry failed", String(candidate._id), error.message); }
  }
}
