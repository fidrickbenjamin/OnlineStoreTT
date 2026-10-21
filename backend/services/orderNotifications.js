import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";
import { generateOrderEmail, generateAdminOrderEmail } from "../utils/emailNotification.js";
export async function notifyOrder(order, subject = "Your Tactical Trends order") {
  const customer = await User.findById(order.user).select("name email");
  const admins = await User.find({ role: "admin" }).select("email");
  const recipient=order.buyerInfo?.email?{name:order.buyerInfo.name,email:order.buyerInfo.email}:customer;
  const messages = [];
  if (recipient?.email) messages.push({ email: recipient.email, subject, html: generateOrderEmail(order, recipient) });
  for (const admin of admins) if (admin.email) messages.push({ email: admin.email, subject: `Order ${String(order._id).slice(-8)}: ${subject}`, html: generateAdminOrderEmail(order, customer) });
  const outcomes = await Promise.allSettled(messages.map(sendEmail));
  return outcomes.every(result => result.status === "fulfilled");
}
