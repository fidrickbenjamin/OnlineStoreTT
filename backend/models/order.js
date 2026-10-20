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
        landmark: { type: String, maxlength: 200 },
        deliveryNotes: { type: String, maxlength: 500 },
        country: {
            type: String,
            required: true,
        },
    },
    dedupeKey: { type: String },
    expiresAt: Date,
    inventoryTracked: { type: Boolean, default: false },
    inventoryState: { type: String, enum: ["Unallocated", "Reserved", "Released"], default: "Unallocated" },
    inventoryLock: { token: String, until: Date },
    archived: { type: Boolean, default: false },
    cancelRequestedAt: Date,
    internalNotes: [{ text: { type: String, maxlength: 2000 }, author: String, createdAt: { type: Date, default: Date.now } }],
    timeline: [{ message: String, createdAt: { type: Date, default: Date.now } }],
    paymentProof: {
      proofId: String, data: { type: Buffer, select: false }, mime: String,
      uploadedAt: Date, reference: String, reviewStatus: { type: String, enum: ["Pending", "Approved", "Rejected"] },
      reviewReason: String, reviewedAt: Date, reviewedBy: String,
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
        values: ["COD", "Card", "NBD", "CASH", "ShopdmPay", "PayPal"],
        message: "Please select a supported payment method",
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

orderSchema.index({ dedupeKey: 1 }, { unique: true, partialFilterExpression: { dedupeKey: { $type: "string" } } });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "paymentInfo.status": 1, createdAt: -1 });
orderSchema.index({ expiresAt: 1 });
export default mongoose.model("order", orderSchema);
