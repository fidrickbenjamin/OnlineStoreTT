import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js";
import ErrorHandler from "../utils/errorHandler.js";
import Product from "../models/product.js";
import nodemailer from "nodemailer";
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";
import { generateOrderEmail, generateAdminOrderEmail } from "../utils/emailNotification.js";


// ✅ CREATE NEW ORDER
export const newOrder = catchAsyncErrors(async (req, res, next) => {
   const {
      orderItems,
      shippingOption,
      shippingInfo,
      itemsPrice,
      taxAmount,
      shippingAmount,
      totalAmount,
      paymentMethod,
      paymentInfo,
   } = req.body;

   // 🔒 VALIDATIONS (PREVENT SERVER CRASHES)
   if (!orderItems || orderItems.length === 0) {
      return next(new ErrorHandler("No order items provided", 400));
   }

   if (!shippingInfo) {
      return next(new ErrorHandler("Shipping info is required", 400));
   }

   if (!shippingOption) {
      return next(new ErrorHandler("Shipping option is required", 400));
   }

   if (!totalAmount) {
      return next(new ErrorHandler("Total amount is missing", 400));
   }

   if (!req.user || !req.user._id) {
      return next(new ErrorHandler("User not authenticated", 401));
   }

   // ✅ CREATE ORDER
   const order = await Order.create({
      orderItems,
      shippingInfo,
      shippingOption,
      itemsPrice,
      taxAmount,
      shippingAmount,
      totalAmount,
      paymentMethod,
      paymentInfo,
      user: req.user._id,
   });

   // ✅ SAFE TOTAL FORMAT
   const formattedTotalAmount = parseFloat(order.totalAmount || 0).toFixed(2);

   // ✅ SEND USER EMAIL (SAFE)
   try {
      const userEmailContent = generateOrderEmail(order, req.user);

      await sendEmail({
         email: req.user.email,
         subject: "New Order Created!",
         message: userEmailContent,
         isHtml: true,
      });
   } catch (err) {
      console.error("User email failed:", err.message);
   }

   // ✅ SEND ADMIN EMAILS (SAFE)
   try {
      const adminUsers = await User.find({ role: "admin" });
      const adminEmailContent = generateAdminOrderEmail(order, req.user);

      for (let admin of adminUsers) {
         await sendEmail({
            email: admin.email,
            subject: `New Order Alert: Order #${order._id}`,
            message: adminEmailContent,
            isHtml: true,
         });
      }
   } catch (err) {
      console.error("Admin email failed:", err.message);
   }

   res.status(200).json({
      success: true,
      order,
   });
});


// ✅ GET CURRENT USER ORDERS
export const myOrders = catchAsyncErrors(async (req, res, next) => {
   const orders = await Order.find({ user: req.user._id });

   res.status(200).json({
      success: true,
      orders,
   });
});


// ✅ GET SINGLE ORDER DETAILS
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
   const order = await Order.findById(req.params.id).populate("user", "name email");

   if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
   }

   res.status(200).json({
      success: true,
      order,
   });
});


// ✅ GET ALL ORDERS (ADMIN)
export const allOrders = catchAsyncErrors(async (req, res, next) => {
   const orders = await Order.find();

   res.status(200).json({
      success: true,
      orders,
   });
});


// ✅ UPDATE ORDER (ADMIN)
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
   const order = await Order.findById(req.params.id);

   if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
   }

   if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("You have already delivered this order", 400));
   }

   let productNotFound = false;

   for (const item of order.orderItems) {
      const product = await Product.findById(item?.product?.toString());

      if (!product) {
         productNotFound = true;
         break;
      }

      product.stock -= item.quantity;
      await product.save({ validateBeforeSave: false });
   }

   if (productNotFound) {
      return next(new ErrorHandler("Product not found", 404));
   }

   // Update order status
   if (req.body.status) {
      order.orderStatus = req.body.status;

      if (req.body.status === "Delivered") {
         order.deliveredAt = Date.now();
      }
   }

   // Update payment status
   if (req.body.paymentStatus) {
      order.paymentInfo.status = req.body.paymentStatus;
   }

   // Update payment method
   if (req.body.paymentMethod) {
      order.paymentMethod = req.body.paymentMethod;
   }

   await order.save();

   res.status(200).json({
      success: true,
   });
});


// ✅ DELETE ORDER
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
   const order = await Order.findById(req.params.id);

   if (!order) {
      return next(new ErrorHandler("No Order found with this ID", 404));
   }

   await order.deleteOne();

   res.status(200).json({
      success: true,
   });
});


// ✅ SALES DATA
async function getSalesData(startDate, endDate) {
   const salesData = await Order.aggregate([
      {
         $match: {
            createdAt: {
               $gte: new Date(startDate),
               $lte: new Date(endDate),
            },
         },
      },
      {
         $group: {
            _id: {
               date: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
               },
            },
            totalSales: { $sum: "$totalAmount" },
            numOrders: { $sum: 1 },
         },
      },
   ]);

   const salesMap = new Map();
   let totalSales = 0;
   let totalNumOrders = 0;

   salesData.forEach((entry) => {
      const date = entry._id.date;
      salesMap.set(date, {
         sales: entry.totalSales,
         numOrders: entry.numOrders,
      });

      totalSales += entry.totalSales;
      totalNumOrders += entry.numOrders;
   });

   const datesBetween = getDatesBetween(startDate, endDate);

   const finalSalesData = datesBetween.map((date) => ({
      date,
      sales: (salesMap.get(date) || { sales: 0 }).sales,
      numOrders: (salesMap.get(date) || { numOrders: 0 }).numOrders,
   }));

   return { salesData: finalSalesData, totalSales, totalNumOrders };
}

function getDatesBetween(startDate, endDate) {
   const dates = [];
   let currentDate = new Date(startDate);

   while (currentDate <= new Date(endDate)) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
   }

   return dates;
}


// ✅ GET SALES
export const getSales = catchAsyncErrors(async (req, res, next) => {
   const startDate = new Date(req.query.startDate);
   const endDate = new Date(req.query.endDate);

   startDate.setUTCHours(0, 0, 0, 0);
   endDate.setUTCHours(23, 59, 59, 999);

   const { salesData, totalSales, totalNumOrders } =
      await getSalesData(startDate, endDate);

   res.status(200).json({
      success: true,
      totalSales,
      totalNumOrders,
      sales: salesData,
   });
});


// ✅ EMAIL CONFIG (USED FOR CANCEL ORDER)
const transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
      user: "your-email@example.com",
      pass: "your-email-password",
   },
});


// ✅ CANCEL ORDER
export const cancelOrder = catchAsyncErrors(async (req, res, next) => {
   const order = await Order.findById(req.params.id);

   if (!order) {
      return next(new ErrorHandler("Order not found", 404));
   }

   if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("Order already delivered", 400));
   }

   try {
      const admins = await User.find({ role: "admin" });

      await Promise.all(
         admins.map((admin) =>
            transporter.sendMail({
               from: "your-email@example.com",
               to: admin.email,
               subject: "Order Cancellation Request",
               text: `Order ID ${order._id} cancellation requested.`,
            })
         )
      );
   } catch (err) {
      console.error("Cancel email failed:", err.message);
   }

   order.orderStatus = "Cancel Requested";
   await order.save();

   res.status(200).json({
      success: true,
      message: "Cancellation request sent",
   });
});