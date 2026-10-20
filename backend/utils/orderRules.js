import crypto from "node:crypto";
export const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
export const deliveryOptions = {
  pickup: { label: "Pickup", fee: 0, instructions: "We will contact you to confirm the collection location and time. Please wait for confirmation before travelling.", estimate: "Collection time confirmed after order review" },
  roseau: { label: "Roseau delivery", fee: 15, instructions: "Delivery within the Roseau service area. Enter your community and a nearby landmark; we will confirm the delivery time.", estimate: "Delivery time confirmed after order review" },
  portsmouth: { label: "Portsmouth delivery", fee: 15, instructions: "Delivery within the Portsmouth service area. Enter your community and a nearby landmark; we will confirm the delivery time.", estimate: "Delivery time confirmed after order review" },
};
export function groupItems(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100) throw new Error("Provide between 1 and 100 order items.");
  const grouped = new Map();
  for (const item of items) {
    const id = String(item.product || ""); const quantity = Number(item.quantity);
    if (!/^[a-f\d]{24}$/i.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("Invalid product or quantity.");
    grouped.set(id, (grouped.get(id) || 0) + quantity);
    if (grouped.get(id) > 99) throw new Error("Maximum quantity per product is 99.");
  }
  return [...grouped].sort(([a], [b]) => a.localeCompare(b)).map(([product, quantity]) => ({ product, quantity }));
}
export function calculateTotals(items, option) {
  if (!deliveryOptions[option]) throw new Error("Choose a supported delivery option.");
  const itemsPrice = roundMoney(items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0));
  const taxAmount = roundMoney(itemsPrice * .15), shippingAmount = deliveryOptions[option].fee;
  return { itemsPrice, taxAmount, shippingAmount, totalAmount: roundMoney(itemsPrice + taxAmount + shippingAmount) };
}
export function checkoutFingerprint(user, items, shippingInfo, shippingOption, paymentMethod) {
  const fields = ["address", "city", "zipCode", "phoneNo", "country", "landmark", "deliveryNotes"];
  const shipping = Object.fromEntries(fields.map(key => [key, String(shippingInfo[key] || "").trim()]));
  return crypto.createHash("sha256").update(JSON.stringify([String(user), groupItems(items), shipping, shippingOption, paymentMethod])).digest("hex");
}
export const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
export const paymentStatuses = ["Not Paid", "Pending", "Verifying", "Paid", "Failed", "Refunded"];
export const methods = ["COD", "Card", "NBD", "CASH", "ShopdmPay", "PayPal"];
export function validateTransition(from, to) {
  const next = { Pending: ["Pending", "Processing", "Cancelled"], Processing: ["Processing", "Shipped", "Delivered", "Cancelled"], Shipped: ["Shipped", "Delivered"], Delivered: ["Delivered"], Cancelled: ["Cancelled"] };
  return Boolean(next[from]?.includes(to));
}
export function parseDateRange(start, end) {
  const startDate = new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(start)) ? `${start}T00:00:00-04:00` : start), endDate = new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(end)) ? `${end}T23:59:59.999-04:00` : end);
  if (!Number.isFinite(+startDate) || !Number.isFinite(+endDate)) throw new Error("Choose valid start and end dates.");

  if (startDate > endDate || endDate - startDate > 366 * 86400000) throw new Error("Date range must be ordered and no longer than 366 days.");
  return { startDate, endDate };
}
export function decodeProof(dataUrl) {
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ""));
  if (!match) throw new Error("Upload a PNG, JPEG, or WebP image.");
  const data = Buffer.from(match[2], "base64");
  if (!data.length || data.length > 450 * 1024) throw new Error("Receipt image must be smaller than 450 KB.");
  const valid = match[1] === "png" ? data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : match[1] === "jpeg" ? data[0] === 255 && data[1] === 216 && data[2] === 255 : data.toString("ascii",0,4) === "RIFF" && data.toString("ascii",8,12) === "WEBP";
  if (!valid) throw new Error("Receipt contents do not match the image format.");
  return { data, mime: `image/${match[1]}` };
}
