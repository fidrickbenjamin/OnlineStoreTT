// Keep financial evidence and provider sessions available for reconciliation.
export function orderDeletion(order, admin = false) {
  const payment = order.paymentInfo || {};
  let reason = "";
  if (!["Not Paid", "Pending", "Verifying", "Failed"].includes(payment.status) || payment.paidAt)
    reason = "Paid and refunded orders must be retained. You can archive them instead.";
  else if (["Shipped", "Delivered"].includes(order.orderStatus) || order.deliveredAt)
    reason = "Shipped and delivered orders must be retained.";
  else if (order.paymentProof?.uploadedAt || order.paymentProof?.proofId)
    reason = "This order has a bank receipt. Contact the store to review or cancel it; its payment record must be retained.";
  else if (payment.id || payment.reference || order.paymentMethod === "Card" ||
    (["PayPal", "ShopdmPay"].includes(order.paymentMethod) && !order.expiresAt))
    reason = "Online checkout has started or needs checking. Contact the store to reconcile payment before cancelling; archive the record afterwards.";
  else if (!order.inventoryTracked)
    reason = "The store must reconcile this older order’s stock before it can be deleted.";
  else if (!admin && !["Pending", "Cancelled"].includes(order.orderStatus))
    reason = "The store is preparing this order. Request cancellation or contact the store.";
  return { allowed: !reason, reason };
}
