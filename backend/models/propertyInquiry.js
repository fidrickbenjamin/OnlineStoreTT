import mongoose from "mongoose";

const propertyInquirySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  preferredViewingDate: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 32,
  },
  status: {
    type: String,
    enum: ["New", "Contacted", "Closed"],
    default: "New",
  },
}, { timestamps: true });

export default mongoose.model("PropertyInquiry", propertyInquirySchema);
