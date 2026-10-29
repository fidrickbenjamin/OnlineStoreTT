import {activeCampaigns,priceProduct,priceExpression} from "../services/promotionPricing.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import APIFilters from "../utils/apiFilters.js";
import Order from "../models/order.js";
import {delete_file, upload_file} from "../utils/cloudinary.js";

// Create new product => /api/v2/products
export const getProducts = catchAsyncErrors(async (req, res, next) => {

    const resPerPage = 20, now = new Date(), campaigns = await activeCampaigns(now);
    const query = new APIFilters(Product, req.query).search().filters().query;
    const filter = query.getFilter(), priceFilter = filter.price; delete filter.price;
    const sort = Object.fromEntries(Object.entries(query.getOptions().sort).map(([key,value])=>[key==="price"?"_promoPrice":key,value]));
    const page=Math.max(1,Math.min(100000,Math.floor(Number(req.query.page)||1)));
    const pipeline=[{$match:filter},{$addFields:{_promoPrice:priceExpression(campaigns,now)}}];
    if(priceFilter)pipeline.push({$match:{_promoPrice:priceFilter}});
    if(req.query.dealsOnly==="true")pipeline.push({$match:{$expr:{$lt:["$_promoPrice","$price"]}}});
    if(req.query.campaign){
      const campaign=campaigns.find(row=>String(row._id)===String(req.query.campaign));
      pipeline.push({$match:campaign?(campaign.scope==="products"?{_id:{$in:campaign.products}}:{"category.main":campaign.category}):{_id:{$in:[]}}});
    }
    pipeline.push({$facet:{metadata:[{$count:"count"}],products:[{$sort:sort},{$skip:(page-1)*resPerPage},{$limit:resPerPage},{$project:{reviews:0,inventoryAllocations:0,_promoPrice:0}}]}});
    const [result]=await Product.aggregate(pipeline);
    res.set("Cache-Control","no-store").json({resPerPage,filteredProductsCount:result?.metadata?.[0]?.count||0,products:(result?.products||[]).map(product=>priceProduct(product,campaigns,now)),serverTime:now});
});


// A small, promotion-aware feed independent of catalogue pagination.
export const getFeaturedProducts = catchAsyncErrors(async (req, res) => {
    const now = new Date(), campaigns = await activeCampaigns(now);
    const eligible = { listingType: { $ne: "property" }, "category.main": { $ne: "Property or Real Estate" }, stock: { $gt: 0 }, "images.0.url": { $regex: /^https?:\/\//i } };
    let products = await Product.find({ ...eligible, heroFeatured: true }).select("-reviews -inventoryAllocations").sort({ heroOrder: 1, createdAt: -1, _id: -1 }).limit(5).lean();
    const curated = products.length > 0;
    if (!curated) products = await Product.find(eligible).select("-reviews -inventoryAllocations").sort({ createdAt: -1, _id: -1 }).limit(5).lean();
    res.set("Cache-Control", "no-store").json({ products: products.map(product => priceProduct(product, campaigns, now)), curated, serverTime: now });
});
function validateHeroFields(body) {
    if (body.heroFeatured !== undefined && typeof body.heroFeatured !== "boolean") throw new ErrorHandler("Choose whether to feature this product.", 400);
    if (body.heroOrder !== undefined && (!Number.isInteger(body.heroOrder) || body.heroOrder < 0 || body.heroOrder > 999)) throw new ErrorHandler("Homepage display order must be a whole number from 0 to 999.", 400);
}

// Create new Product => /api/v2/admin/products
export const newProduct = catchAsyncErrors(async (req, res) => {

    validateHeroFields(req.body);
    for(const [key,max] of [["purchaseUnit",80],["packContents",1000]])if(req.body[key]!==undefined){if(typeof req.body[key]!=="string"||req.body[key].length>max)throw new ErrorHandler(`Check ${key} (maximum ${max} characters).`,400);req.body[key]=req.body[key].trim();}
    delete req.body.inventoryAllocations;
    delete req.body.directSale;
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


    const now = new Date();
    res.set("Cache-Control","no-store").json({product:priceProduct(product,await activeCampaigns(now),now)});
});



// Get products -ADMIN => /api/v2/admin/products/
export const getAdminProducts = catchAsyncErrors(async (req, res, next ) => {
    
    const products = await Product.find();

    res.status(200).json({
        products,
    });
});





// Update Product Details => /api/v2/products/:id
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
    
    validateHeroFields(req.body);
    for(const [key,max] of [["purchaseUnit",80],["packContents",1000]])if(req.body[key]!==undefined){if(typeof req.body[key]!=="string"||req.body[key].length>max)throw new ErrorHandler(`Check ${key} (maximum ${max} characters).`,400);req.body[key]=req.body[key].trim();}
    delete req.body.inventoryAllocations;
    delete req.body.directSale;
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
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
    if (await Product.exists({ _id: req.params.id, "inventoryAllocations.0": { $exists: true } })) throw new ErrorHandler("This product has order stock allocations. Set its available stock to zero instead of deleting it.", 409);
    
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