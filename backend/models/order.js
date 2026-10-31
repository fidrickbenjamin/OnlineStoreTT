import mongoose from "mongoose"; 

const orderSchema = new mongoose.Schema({
    commercial: {type:mongoose.Schema.Types.Mixed,select:false},
    buyerInfo: {name:String,email:String,country:String,phoneNo:String},
    shippingInfo: {
        recipientName: {type:String,maxlength:80},
        deliveryFor: {type:String,enum:["self","other"]},
        contactPreference: {type:String,enum:["buyer","recipient"]},
        deliveryArea: String,
        isGift: Boolean,
        giftMessage: {type:String,maxlength:300},
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

        purchaseUnit: String,
        packContents: String,
        regularPrice: Number,
        discountPerUnit: Number,
        promotionId: String,
        promotionName: String,
        campaignId: {type:mongoose.Schema.Types.ObjectId,ref:"Promotion"},
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
    refundedAt: Date,
    refundMethod: String,
    paidCashHolder: String,
},

totalSavings: {type:Number,default:0},

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

deliverySnapshot: { label:String, fee:Number, instructions:String, estimate:String, communities:[String], enabled:Boolean },
shippingOption: {
    type: String,
    maxlength: 60,
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
