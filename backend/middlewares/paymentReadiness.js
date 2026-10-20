import Order from "../models/order.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import { withOrderLock, ensureReserved } from "../services/orderInventory.js";
// This guard leaves the existing payment provider controllers unchanged.
export default catchAsyncErrors(async (req, res, next) => {
  const id = req.params.orderId || req.body.orderId;
  const existing = await Order.findOne({ _id: id, user: req.user._id });
  if (!existing) throw new ErrorHandler("Order not found", 404);
  if (existing.paymentInfo?.status === "Paid") {
    if (req.params.orderId) return next();
    throw new ErrorHandler("This order is already paid.", 409);
  }
  await withOrderLock(id, async order => {
    if (order.orderStatus === "Cancelled" || order.cancelRequestedAt || order.paymentInfo?.status === "Refunded") throw new ErrorHandler("This order is not available for payment. Contact the store.", 409);
    await ensureReserved(order);
    // A provider may complete after the customer leaves. Once checkout starts,
    // only an explicit, reconciled cancellation can release its stock.
    order.expiresAt = undefined;
    await order.save();
  });
  next();
});
