import PropertyInquiry from "../models/propertyInquiry.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

export const createPropertyInquiry = catchAsyncErrors(async (req, res, next) => {
  const { productId, name, phone, email, preferredViewingDate, message } = req.body;

  if (!productId || !name || !phone || !email || !preferredViewingDate || !message) {
    return next(new ErrorHandler("Please provide all requested inquiry details", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Property not found", 404));
  }

  const inquiry = await PropertyInquiry.create({
    product: productId,
    name,
    phone,
    email,
    preferredViewingDate,
    message,
  });

  res.status(201).json({ success: true, inquiry });
});

export const getPropertyInquiries = catchAsyncErrors(async (req, res) => {
  const inquiries = await PropertyInquiry.find().populate("product", "name").sort({ createdAt: -1 });
  res.status(200).json({ inquiries });
});

export const updatePropertyInquiryStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const inquiry = await PropertyInquiry.findById(id);

  if (!inquiry) {
    return next(new ErrorHandler("Inquiry not found", 404));
  }

  inquiry.status = req.body.status || inquiry.status;
  await inquiry.save();

  res.status(200).json({ success: true, inquiry });
});
