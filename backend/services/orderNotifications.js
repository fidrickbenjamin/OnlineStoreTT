import User from "../models/user.js";
import {queueMail} from "./mailOutbox.js";
import {fullAdmin,can} from "../hubs/permissions.js";
import { generateOrderEmail, generateAdminOrderEmail } from "../utils/emailNotification.js";
export async function notifyOrder(order, subject = "Your Tactical Trends order") {
  const customer = await User.findById(order.user).select("name email");
  const admins = await User.find({ role: "admin" }).select("email role adminAccess");
  const recipient=order.buyerInfo?.email?{name:order.buyerInfo.name,email:order.buyerInfo.email}:customer;
  const messages = [];
  if (recipient?.email) messages.push({ email: recipient.email, subject, html: generateOrderEmail(order, recipient) });
  for (const admin of admins) if (admin.email&&(fullAdmin(admin)||can(admin,'operations')||can(admin,'finance'))) messages.push({ email: admin.email, subject: `Order ${String(order._id).slice(-8)}: ${subject}`, html: generateAdminOrderEmail(order, customer) });
  const outcomes = await Promise.allSettled(messages.map(message=>queueMail(message)));
  return outcomes.every(result => result.status === "fulfilled");
}
