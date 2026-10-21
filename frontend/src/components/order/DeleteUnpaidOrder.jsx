import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDeleteOrderMutation } from "../../redux/api/OrderApi";
import { orderNumber } from "../shared/OrderUI";
import { keepDialogFocus } from "../shared/dialogFocus";

export default function DeleteUnpaidOrder({ order, admin = false, detail = false }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [remove, { isLoading }] = useDeleteOrderMutation();
  const navigate = useNavigate();
  if (!order.deletion?.allowed) return detail && order.deletion?.reason
    ? <p className="small text-muted mt-3">{order.deletion.reason}</p> : null;
  const close = () => { if (!isLoading) { setOpen(false); setError(""); } };
  const submit = async () => {
    setError("");
    try {
      const result = await remove({ id: order._id, admin }).unwrap();
      toast.success(result.message);
      setOpen(false);
      if (detail) navigate(admin ? "/admin/orders" : "/me/orders", { replace: true });
    } catch (err) {
      const message = err?.data?.message || "Could not delete this order. Please try again.";
      setError(message);
      toast.error(message);
    }
  };
  return <>
    <button type="button" className={`btn ${admin ? "btn-sm " : ""}btn-outline-danger`} onClick={() => setOpen(true)} aria-label={`Delete unpaid order ${orderNumber(order)}`}><i className="bi bi-trash3" aria-hidden="true"/> Delete unpaid order</button>
    <Modal show={open} onHide={close} onKeyDown={keepDialogFocus} centered aria-labelledby={`delete-order-${order._id}`} backdrop={isLoading ? "static" : true} keyboard={!isLoading}>
      <Modal.Header closeButton={!isLoading}><Modal.Title id={`delete-order-${order._id}`}>Delete this unpaid order?</Modal.Title></Modal.Header>
      <Modal.Body><p><strong>{orderNumber(order)}</strong> will be permanently removed from your order history and the store’s order list. Reserved stock will be returned.</p><p className="mb-0">This cannot be undone. You can place a new order later.</p>{error && <p className="alert alert-danger mt-3 mb-0" role="alert">{error}</p>}</Modal.Body>
      <Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={isLoading} onClick={close} autoFocus>Keep order</button><button type="button" className="btn btn-danger" disabled={isLoading} onClick={submit}>{isLoading ? "Deleting…" : "Yes, delete order"}</button></Modal.Footer>
    </Modal>
  </>;
}
