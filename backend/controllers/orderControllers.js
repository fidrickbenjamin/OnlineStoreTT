import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js";
import ErrorHandler from "../utils/errorHandler.js";
import Product from "../models/product.js";
import nodemailer from "nodemailer";
import Admin from "../models/user.js"; 
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";
import {generateOrderEmail, generateAdminOrderEmail} from "../utils/emailNotification.js"

// Create New Order => /api/v2/orders/new
export const newOrder = catchAsyncErrors(async (req, res, next) => {
   const {
       orderItems,
       shippingInfo,
       itemsPrice,
       taxAmount,
       shippingAmount,
       totalAmount,
       paymentMethod,
       paymentInfo,
   } = req.body;
 
   // Create the new order in the database
   const order = await Order.create({
       orderItems,
       shippingInfo,
       itemsPrice,
       taxAmount,
       shippingAmount,
       totalAmount,
       paymentMethod,
       paymentInfo,
       user: req.user._id,
   });
 
   // Format total amount to 2 decimal places if needed
   const formattedTotalAmount = parseFloat(order.totalAmount).toFixed(2);
 
   // Generate email content using the template function for the user
   const userEmailContent = generateOrderEmail(order, req.user);
 
   // Prepare email subject for user
   const subject = "New Order Created!";
 
   // Send email to the user who placed the order
   await sendEmail({
       email: req.user.email,
       subject: subject,
       message: userEmailContent, // Use the generated email content for the user
       isHtml: true, // Ensure sendEmail knows this is HTML content
   });

   // Admin notification: Retrieve all admin users' emails
   const adminUsers = await User.find({ role: 'admin' }); // assuming a User model with 'role' field
   const adminEmails = adminUsers.map(admin => admin.email);

   // Generate the same email content for admins using the new admin email template
   const adminEmailContent = generateAdminOrderEmail(order, req.user);
 
   // Send email to all admin users
   for (let email of adminEmails) {
       await sendEmail({
           email: email,
           subject: `New Order Alert: Order #${order._id}`,
           message: adminEmailContent, // Use the new admin-specific email content
           isHtml: true,
       });
   }
 
   res.status(200).json({
     success: true,
     order,
   });
 });


// Get current user orders => /api/v2/me/orders
export const myOrders = catchAsyncErrors(async (req, res, next) => {
   const  orders = await Order.find({ user: req.user._id });

   res.status(200).json({
      orders,
     });

});



// Get order details => /api/v2/orders/:id
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
         const  order = await Order.findById(req.params.id).populate("user", "name email");

        if(!order) {
         return next(new ErrorHandler("No Order found with this ID", 404));
        }

         res.status(200).json({
            order,
           });

});


// Get all orders - ADMIN => /api/v2/admin/orders
export const allOrders = catchAsyncErrors(async (req, res, next) => {
   const  orders = await Order.find();

   res.status(200).json({
      orders,
     });

});


// Update order - ADMIN => /api/v2/admin/orders/:id
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
   const  order = await Order.findById(req.params.id);

        if(!order) {
         return next(new ErrorHandler("No Order found with this ID", 404));
        }

        if(order?.orderStatus === "Delivered") {
         return next(new ErrorHandler("You have already delivered this order", 400));
        }

        let productNotFound = false
         //update products stock
        for (const item of order.orderItems) {
         const product = await Product.findById(item?.product?.toString());
         if(!product) {
            productNotFound = true;
            break;
           }
         product.stock = product.stock - item.quantity;
         await product.save({ validateBeforeSave: false });
        }

        if(productNotFound) {
         return next(new ErrorHandler("No product found with one or more IDs", 404));
        }

      // Update Order Status
   if (req.body.status) {
      order.orderStatus = req.body.status;

      // Only set deliveredAt if the order is delivered
      if (req.body.status === "Delivered") {
         order.deliveredAt = Date.now();
      }
   }

   // Update payment status if provided
   if (req.body.paymentStatus) {
      order.paymentInfo.status = req.body.paymentStatus;
   }

   // Update payment method if provided
   if (req.body.paymentMethod) {
      order.paymentMethod = req.body.paymentMethod;
   }

   await order.save();

   res.status(200).json({
      success: true,
   });
});


// Delete order - ADMIN => /api/v2/admin/orders/:id
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
   const  order = await Order.findById(req.params.id);

  if(!order) {
   return next(new ErrorHandler("No Order found with this ID", 404));
  }

  await order.deleteOne();

   res.status(200).json({
      success: true,
     });

});

async function getSalesData(startDate, endDate) {
const salesData = await Order.aggregate([
   {
      // Stage 1 - Filter results
      $match : {
         createdAt:{
            $gte: new Date(startDate),
            $lte: new Date(endDate),
         },
      },
   },
   {
      // Stage 2 - Group Data
      $group: {
         _id:{
            date: { $dateToString: { format: "%Y-%m-%d", date:"$createdAt"} },
         },
         totalSales: { $sum: "$totalAmount"},
         numOrders: { $sum: 1 }, // Count the nummber of orders 
      },

   },
]);

 



// Create a map to store sales data and num of order by data
const salesMap = new Map()
let totalSales = 0;
let totalNumOrders = 0;

salesData.forEach((entry) => {
   const date = entry?._id.date;
   const sales = entry?.totalSales;
   const numOrders = entry?.numOrders;

   salesMap.set(date, {sales, numOrders});
   totalSales += sales;
   totalNumOrders += numOrders;
});



// Generate an array of dates between start and end date
const datesBetween = getDatesBetween(startDate, endDate);

 

// Create final sales datat Array with 0 for dates without sale

const finalSalesData = datesBetween.map((date) => ({
   date,
   sales: (salesMap.get(date) || {sales: 0}).sales,
   numOrders: (salesMap.get(date) || {numOrders: 0}).numOrders,
}));
 

return { salesData: finalSalesData, totalSales, totalNumOrders };

}

function getDatesBetween(startDate, endDate) {
   const dates= [];
   let currentDate = new Date(startDate);

   while(currentDate <= new Date(endDate)) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      dates.push(formattedDate);
      currentDate.setDate(currentDate.getDate() + 1);
   }

   return dates;
}

// Get Sales Data  => /api/v2/admin/get_sales 
export const getSales = catchAsyncErrors(async (req, res, next) => {
    
   const startDate = new Date(req.query.startDate);
   const endDate = new Date(req.query.endDate);

   startDate.setUTCHours(0, 0, 0, 0);
   endDate.setUTCHours(23, 59, 59, 999);
   
getSalesData();


  const {salesData, totalSales, totalNumOrders} = await getSalesData(startDate, endDate);

   res.status(200).json({
      totalSales,
      totalNumOrders,
      sales: salesData,
     });

});



// Configure nodemailer
const transporter = nodemailer.createTransport({
   service: 'gmail', // or another email service
   auth: {
       user: 'your-email@example.com',
       pass: 'your-email-password',
   },
});

// Cancel Order
export const cancelOrder = catchAsyncErrors(async (req, res, next) => {
   try {
       const orderId = req.params.id;
       const order = await Order.findById(orderId);

       if (!order) {
           return next(new ErrorHandler("Order not found", 404));
       }

       if (order.orderStatus === 'Delivered') {
           return next(new ErrorHandler("Order already delivered", 400));
       }

       // Notify admins
       const admins = await Admin.find(); // Fetch all admin users
       const emailPromises = admins.map(admin => {
           return transporter.sendMail({
               from: 'your-email@example.com',
               to: admin.email,
               subject: 'Order Cancellation Request',
               text: `Order ID ${orderId} has been requested for cancellation.`,
           });
       });

       await Promise.all(emailPromises);

       // Update order status to 'Cancel Requested' or similar
       order.orderStatus = 'Cancel Requested';
       await order.save();

       res.status(200).json({
           message: 'Cancellation request sent to admins',
       });
   } catch (error) {
       next(new ErrorHandler(error.message, 500));
   }
});

