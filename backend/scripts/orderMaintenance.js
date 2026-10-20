// Optional scheduler entry point: node backend/scripts/orderMaintenance.js
// Loads existing environment configuration; never ships any credentials.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: process.env.NODE_ENV === "PRODUCTION" ? path.join(root,".env.production") : path.join(root,"backend/config/config.env") });
const { default: Order } = await import("../models/order.js");
const { expireOrders, withOrderLock, ensureReserved } = await import("../services/orderInventory.js");
const uri = process.env.NODE_ENV === "PRODUCTION" ? process.env.DB_URI : process.env.DB_LOCAL_URI;
if (!uri) throw new Error("Existing DB_LOCAL_URI or DB_URI must be configured.");
try {
  await mongoose.connect(uri); await Order.createIndexes();
  // Complete interrupted allocations, or flag them for the administrator.
  const incomplete = await Order.find({ inventoryTracked:true, inventoryState:"Unallocated", orderStatus:{$ne:"Cancelled"} }).limit(100);
  for (const order of incomplete) {
    try { await withOrderLock(order._id, ensureReserved); }
    catch (error) { console.error("Order requires inventory review", String(order._id), error.message); }
  }
  await expireOrders();
  console.log("Order maintenance complete. Provider-started orders require manual reconciliation before stock release.");
} finally { await mongoose.disconnect(); }
