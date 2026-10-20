import React from "react";
import "./store-upgrade.css";
export const money = value => `XCD ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const orderNumber = order => order.orderNumber || `TT-${String(order._id || "").slice(-8).toUpperCase()}`;
export function StatusBadge({ value }) { return <span className={`tt-status ${["Paid","Delivered","Approved"].includes(value) ? "tt-good" : ["Cancelled","Failed","Refunded","Rejected"].includes(value) ? "tt-bad" : "tt-wait"}`}>{value || "Not Paid"}</span>; }
export function OrderSummary({ order }) {
 return <section className="tt-box"><h2>{orderNumber(order)}</h2><p className="text-muted">Placed {new Date(order.createdAt).toLocaleString()}</p><div className="d-flex flex-wrap gap-3"><span>Payment <StatusBadge value={order.paymentInfo?.status}/></span><span>Fulfilment <StatusBadge value={order.orderStatus}/></span></div><p className="mt-3 mb-1"><strong>{order.paymentMethod}</strong> · {money(order.totalAmount)}</p>{order.cancelRequestedAt && <p role="status" className="tt-notice">Cancellation requested. The store will review fulfilment and any refund separately.</p>}{order.orderStatus === "Cancelled" && order.paymentInfo?.status === "Paid" && <p className="tt-notice">Payment is still recorded as paid. Please contact the store about refund arrangements.</p>}</section>;
}
