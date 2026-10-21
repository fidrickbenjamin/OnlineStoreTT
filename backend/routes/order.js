import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { allOrders, deleteOrder, getOrderDetails, getSales, myOrders, newOrder, updateOrder, cancelOrder, uploadPaymentProof, getPaymentProof, reviewPaymentProof, deliverySettings, quoteOrder } from "../controllers/orderControllers.js";

const router = express.Router();

router.get("/delivery/options", deliverySettings);
router.route("/orders/:id/payment-proof").post(isAuthenticatedUser, uploadPaymentProof).get(isAuthenticatedUser, getPaymentProof);
router.post("/admin/orders/:id/payment-proof/review", isAuthenticatedUser, authorizeRoles("admin"), reviewPaymentProof);

router.post("/orders/quote",isAuthenticatedUser,quoteOrder);
router.route("/orders/new").post(isAuthenticatedUser, newOrder);
router.route("/orders/:id").get(isAuthenticatedUser, getOrderDetails).delete(isAuthenticatedUser, deleteOrder);
router.route("/me/orders").get(isAuthenticatedUser, myOrders);

router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), allOrders);
router.route("/admin/get_sales").get(isAuthenticatedUser, authorizeRoles("admin"), getSales);
router.route("/admin/orders/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

// New route for canceling orders
router.route("/orders/cancel-order/:id").post(isAuthenticatedUser, cancelOrder);

export default router;
