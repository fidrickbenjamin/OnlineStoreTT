import mongoose from "mongoose"; 

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        phoneNo: {
            type: String,
            required: true,
        },
        zipCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    orderItems: [{

        name: {
          type: String,
          required: true,
        },
         
        quantity: {
            type: Number,
            required: true,
          },
          image: {
            type: String,
            required: true,
          },
          price: {
            type: String,
            required: true,
          },

          product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Product",
        },
      
    },
],

paymentMethod: {
    type: String,
    required: [true, " Please select a payment method"],
    enum: {
        values: ["COD", "Card", "NBD", "CASH", "ShopdmPay"],
        message: "Please select COD, Card, NBD, CASH or ShopdmPay",
    },
},

paymentInfo: {
     id: String,
    status: {
    type: String,
    enum: [
        "Not Paid",
        "Pending",
        "Verifying",
        "Paid",
        "Failed",
        "Refunded"
    ],
    default: "Not Paid",
},
    provider: String,
    reference: String,
    webhookEventId: String,
    amountXcd: Number,
    customerFeeXcd: Number,
    merchantFeeXcd: Number,
    netAmountXcd: Number,
    amountPaidByCustomerXcd: Number,
    paidAt: Date,
},

itemsPrice: {
    type: Number,
    required: true,
},

taxAmount: {
    type: Number,
    required: true,
},

shippingAmount: {
    type: Number,
    required: true,
},

shippingOption: {
    type: String,
    enum: ["roseau", "portsmouth", "pickup"],
    required: true,
},

totalAmount: {
    type: Number,
    required: true,
},

orderStatus: {
    type: String,
    enum: {
        values: [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ],
        message: "Please select correct order status",
    },
    default: "Pending",
},
deliveredAt: Date,

}, { timestamps: true}
);

export default mongoose.model("order", orderSchema);