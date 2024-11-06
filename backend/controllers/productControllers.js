import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import APIFilters from "../utils/apiFilters.js";
import Order from "../models/order.js";
import {delete_file, upload_file} from "../utils/cloudinary.js";

// Create new product => /api/v2/products
export const getProducts = catchAsyncErrors(async (req, res, next) => {

    const resPerPage = 20;
    const apiFilters = new APIFilters(Product, req.query).search().filters();

    

    let products = await apiFilters.query;
    let filteredProductsCount = products.length;

   

    apiFilters.pagination(resPerPage);
   products = await apiFilters.query.clone();

    res.status(200).json({
        resPerPage,
        filteredProductsCount,
       products,
    });
});


// Create new Product => /api/v2/admin/products
export const newProduct = catchAsyncErrors(async (req, res) => {

    req.body.user = req.user._id;
    
    const product = await Product.create(req.body)

    res.status(200).json({
        product,
    });
});



// Get Single Product Details => /api/v2/products/:id
export const getProductDetails = catchAsyncErrors(async (req, res, next ) => {
    
    const product = await Product.findById(req?.params?.id).populate( "reviews.user");

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }


    res.status(200).json({
        product,
    });
});



// Get products -ADMIN => /api/v2/admin/products/
export const getAdminProducts = catchAsyncErrors(async (req, res, next ) => {
    
    const products = await Product.find();

    res.status(200).json({
        products,
    });
});





// Update Product Details => /api/v2/products/:id
export const updateProduct = catchAsyncErrors(async (req, res) => {
    
    let product = await Product.findById(req?.params?.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

         product = await Product.findByIdAndUpdate(req?.params?.id, req.body, { new: true, });

    res.status(200).json({
        product,
    });
});


// Upload Product Images => /api/v2/admin/products/:id/upload_images
export const uploadProductImages = catchAsyncErrors(async (req, res) => {
    
    let product = await Product.findById(req?.params?.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const uploader = async (image) => upload_file(image, "onlinestore/products"); 

    const urls = await Promise.all((req?.body?.images).map(uploader));

    product?.images?.push(...urls);

    await product?.save();

    res.status(200).json({
        product,
    });
});



// Delete Product Image => /api/v2/admin/products/:id/delete_image
export const deleteProductImage = catchAsyncErrors(async (req, res) => {
    
    let product = await Product.findById(req?.params?.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const isDeleted = await delete_file(req?.body?.imgId);

    if(isDeleted) 
        { product.images = product?.images?.filter(
            (img) => img.public_id !== req.body.imgId
        );

        await product?.save();
    
    }

    res.status(200).json({
        product,
    });
});




// Delete Product  => /api/v2/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res) => {
    
    const product = await Product.findById(req?.params?.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }


    // Deleting image associated with product

    for (let i = 0; i < product?.images?.length; i++) {
        await delete_file(product?.images[i].public_id);
    }

  await product.deleteOne(); 

    res.status(200).json({
        message: "Product Deleted",
    });
});








// Create/Update product review  => /api/v2/reviews
export const createProductReview = catchAsyncErrors(async (req, res, next) => {
    
    const { rating, comment, productId } = req.body;

    const review = { 
        user: req?.user?._id,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

 const isReviewed = product?.reviews?.find(
    (r) => r.user.toString() === req?.user?._id.toString()
 );

 if(isReviewed) {

    product.reviews.forEach((review) => {
        if(review?.user?.toString() === req?.user?._id.toString()) {
            review.comment = comment;
            review.rating = rating;
        }
    });

 } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
 }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});


// Get product reviews  => /api/v2/reviews
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id).populate("reviews.user");

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    console.log(product.reviews);

    res.status(200).json({
        reviews: product.reviews,
    });

});


// Delete product review  => /api/v2/admin/reviews
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
    

   let product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

 const reviews = product?.reviews?.filter(
    (review) => review._id.toString() !== req?.query?.id.toString()
 );

    const numOfReviews = reviews.length;


    const ratings = 
    numOfReviews === 0 ? 0 : product.reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

     product = await Product.findByIdAndUpdate(req.query.productId, { reviews, numOfReviews, ratings }, { new: true });

    res.status(200).json({
        success: true,
        product,
    });
});



// Can User Review  => /api/v2/can_review
export const canUserReview = catchAsyncErrors(async (req, res) => {
    
    const order = await Order.find( {
     user: req.user._id,
     "orderItems.product": req.query.productId,
    });

        if(orders.length === 0) {
            return res.status(200).json({ canReview: false})
        }

    res.status(200).json({
        canReview: true,
    });
});