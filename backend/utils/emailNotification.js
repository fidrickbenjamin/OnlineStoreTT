 function generateOrderEmail(order, user) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Notification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #ff6a00; /* Orange color */
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
          }
          .content h2 {
            color: #ff6a00;
            font-size: 22px;
            margin: 0 0 15px;
          }
          .order-summary {
            border-top: 1px solid #eeeeee;
            padding-top: 20px;
            margin-top: 20px;
          }
          .order-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .order-total {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #eeeeee;
            font-size: 18px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            border-top: 1px solid #eeeeee;
          }
          .footer a {
            color: #ff6a00;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
  
        <div class="email-container">
          <!-- Header Section -->
          <div class="header">
            Order Confirmation
          </div>
  
          <!-- Content Section -->
          <div class="content">
            <h2>Thank you for your order, ${user.name}!</h2>
            <p>Your order #${order._id} has been successfully created and is being processed. Here’s a summary of your order details:</p>
  
            <!-- Order Summary Section -->
            <div class="order-summary">
              <div class="order-item">
                <span>Payment Method:</span>
                <span>${order.paymentMethod}</span>
              </div>
              <div class="order-item">
                <span>Items Price:</span>
                <span>${parseFloat(order.itemsPrice).toFixed(2)} USD</span>
              </div>
              <div class="order-item">
                <span>Tax:</span>
                <span>${parseFloat(order.taxAmount).toFixed(2)} USD</span>
              </div>
              <div class="order-item">
                <span>Shipping:</span>
                <span>${parseFloat(order.shippingAmount).toFixed(2)} USD</span>
              </div>
              <div class="order-total">
                <span>Total Amount:</span>
                <span>${parseFloat(order.totalAmount).toFixed(2)} USD</span>
              </div>
            </div>
  
            <p>We will notify you once your order is on its way. You can view your order history and manage your account on our website.</p>
          </div>
  
          <!-- Footer Section -->
          <div class="footer">
            <p>Need help? Contact our <a href="mailto:support@tactical-trends.com">support team</a> or call us at (767) 285-8487.</p>
            <p>Thank you for shopping with us!</p>
            <p><a href="https://tactrendsshop.com" target="_blank">Visit Our Website</a></p>
          </div>
        </div>
  
      </body>
      </html>
    `;
  }
  
  // Example usage:
  const order = {
    _id: "12345",
    paymentMethod: "Credit Card",
    itemsPrice: 100,
    taxAmount: 8,
    shippingAmount: 5,
    totalAmount: 113
  };
  
  const user = {
    name: "John Doe",
    email: "john.doe@example.com"
  };
  
  // Generate the email HTML
  const emailHTML = generateOrderEmail(order, user);
  
  
  export { generateOrderEmail };




  // admin email template 

  export function generateAdminOrderEmail(order, user) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Alert</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #ff6a00; /* Orange color */
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
          }
          .content h2 {
            color: #ff6a00;
            font-size: 22px;
            margin: 0 0 15px;
          }
          .order-summary {
            border-top: 1px solid #eeeeee;
            padding-top: 20px;
            margin-top: 20px;
          }
          .order-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .order-total {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #eeeeee;
            font-size: 18px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #666666;
            border-top: 1px solid #eeeeee;
          }
          .footer a {
            color: #ff6a00;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
  
        <div class="email-container">
          <!-- Header Section -->
          <div class="header">
            New Order Alert: Order #${order._id}
          </div>
  
          <!-- Content Section -->
          <div class="content">
            <h2>New Order from ${user.name}!</h2>
            <p>Order <b> #${order._id} </b> has been placed and is awaiting processing. Here are the order details:</p>
  
            <!-- Order Summary Section -->
            <div class="order-summary">
              <div class="order-item">
                <span>Customer:</span>
                <span>${user.name}</span>
              </div>
              <div class="order-item">
                <span>Payment Method:</span>
                <span>${order.paymentMethod}</span>
              </div>
              <div class="order-item">
                <span>Items Price:</span>
                <span>${parseFloat(order.itemsPrice).toFixed(2)} USD</span>
              </div>
              <div class="order-item">
                <span>Tax:</span>
                <span>${parseFloat(order.taxAmount).toFixed(2)} USD</span>
              </div>
              <div class="order-item">
                <span>Shipping:</span>
                <span>${parseFloat(order.shippingAmount).toFixed(2)} USD</span>
              </div>
              <div class="order-total">
                <span>Total Amount:</span>
                <span>${parseFloat(order.totalAmount).toFixed(2)} USD</span>
              </div>
            </div>
  
            <p>Please review and process this order in the admin panel. Click the link below to view the order details:</p>
            <p><a href="http://tactrendsshop.com/admin/orders/${order._id}" target="_blank">View Order in Admin Panel</a></p>
          </div>
  
          <!-- Footer Section -->
          <div class="footer">
            <p>Need assistance? Contact our <a href="mailto:support@tactical-trends.com">support team</a> or call us at (767) 285-8487.</p>
            <p>Thank you for managing the orders!</p>
            <p><a href="https://tactrendsshop.com" target="_blank">Visit Our Website</a></p>
          </div>
        </div>
  
      </body>
      </html>
    `;
}