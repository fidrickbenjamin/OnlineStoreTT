import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { useGetProductDetailsQuery } from "../../redux/api/productsApi";
import toast from "react-hot-toast";
import Loader from "../layout/Loader";
import StarRatings from "react-star-ratings";
import { useDispatch, useSelector } from "react-redux";
import { setCartItem } from "../../redux/features/cartSlice";
import MetaData from "../layout/MetaData";
import NewReview from "../reviews/NewReview";
import ListReviews from "../reviews/ListReviews";
import styles from './ProductDetails.module.css';
import NotFound from "../layout/NotFound";

const ProductDetails = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);
    const [activeImg, setActiveImg] = useState("");
    const { data, isLoading, error, isError } = useGetProductDetailsQuery(params?.id);

    const product = data?.product;
    const { isAuthenticated } = useSelector((state) => state.auth);

    const productName = product?.name || "Product";
const productImage = product?.images?.[0]?.url || "/images/default_product.png";
const productUrl = typeof window !== "undefined" ? window.location.href : "";
const productDescription =
    product?.description?.length > 155
        ? `${product.description.substring(0, 152)}...`
        : product?.description || "Check out this product in our store.";


const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.name || "Product",
    description: product?.description || "",
    image: product?.images?.map((img) => img.url) || [],
    brand: {
        "@type": "Brand",
        name: product?.seller || "OnlineStore",
    },
    offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: product?.price ? product.price.toFixed(2) : "0.00",
        availability:
            product?.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
        url: productUrl,
    },
};

    useEffect(() => {
        setActiveImg(product?.images[0]?.url || "/images/default_product.png");
    }, [product]);

    useEffect(() => {
        if (isError) {
            toast.error(error?.data?.message);
        }
    }, [isError, error?.data?.message]); // Added missing dependency

    const increaseQty = () => {
        const count = document.querySelector(".count");
        if (count.valueAsNumber >= product?.stock) return;
        const qty = count.valueAsNumber + 1;
        setQuantity(qty);
    };

    const decreaseQty = () => {
        const count = document.querySelector(".count");
        if (count.valueAsNumber <= 1) return;
        const qty = count.valueAsNumber - 1;
        setQuantity(qty);
    };

    const setItemToCart = () => {
        const cartItem = {
            product: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url,
            stock: product.stock,
            quantity,
        };

        dispatch(setCartItem(cartItem));
        toast.success("Item Added to Cart!");
    };

    const shareProduct = (platform) => {
    if (!product) return;

    const shareUrl =
        productUrl || (typeof window !== "undefined" ? window.location.href : "");
    const text = `Check out ${product?.name} on our store!`;

    if (!shareUrl) {
        toast.error("Unable to generate a share link.");
        return;
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    let socialUrl = "";

    switch (platform) {
        case "facebook":
            socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
            break;
        case "twitter":
            socialUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            break;
        case "whatsapp":
            socialUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
            break;
        default:
            return;
    }

    const shareWindow = window.open(socialUrl, "_blank", "noopener,noreferrer");

    if (!shareWindow) {
        toast.error("Please allow popups for sharing.");
    }
};

    const FacebookIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="me-2"
            viewBox="0 0 24 24"
        >
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.65 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.4c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.35 21.13 22 16.99 22 12z" />
        </svg>
    );

    const TwitterIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="me-2"
            viewBox="0 0 24 24"
        >
            <path d="M18.9 2H22l-6.7 7.65L23.5 22h-5.9l-4.6-6.03L7.7 22H4.6l7.2-8.2L.5 2h6.1l4.1 5.44L18.9 2Zm-1 18h1.1L6.2 4H5.1l12.8 16Z" />
        </svg>
    );

    const WhatsAppIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="me-2"
            viewBox="0 0 24 24"
        >
            <path d="M19.1 4.9A8.97 8.97 0 0 0 12 3C7.03 3 3 7.03 3 12c0 1.58.41 3.12 1.2 4.47L-1.1 7.1 4.7-1.2A8.95 8.95 0 0 0 12 21c4.97 0 9-4.03 9-9 0-2.4-.94-4.67-2.6-6.35ZM12 19.2c-1.42 0-2.8-.38-4.01-1.1l-.29-.17-2.79.73.74-2.72-.18-.29A7.2 7.2 0 0 1 4.8 12c0-3.98 3.22-7.2 7.2-7.2 1.92 0 3.73.75 5.09 2.11A7.18 7.18 0 0 1 19.2 12c0 3.98-3.22 7.2-7.2 7.2Zm3.95-5.4c-.22-.11-1.29-.64-1.49-.71-.2-.07-.35-.11-.49.11-.14.22-.56.71-.69.86-.13.14-.25.16-.47.05-.22-.11-.93-.34-1.77-1.1-.65-.58-1.09-1.29-1.22-1.51-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.14-.22.22-.37.07-.14.04-.26-.02-.37-.06-.11-.49-1.18-.67-1.62-.18-.44-.36-.38-.49-.38h-.42c-.14 0-.37.05-.56.27-.19.22-.73.71-.73 1.74 0 1.03.75 2.02.85 2.16.1.14 1.47 2.25 3.57 3.15.5.22.89.35 1.19.45.5.16 1.0.14 1.38.08.42-.06 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.16-.42-.27Z" />
        </svg>
    );


    if (isLoading) return <Loader />;

    if (error && error?.status === 404) { // Updated to `===`
        return <NotFound />
    }

    return (
        <>
            <MetaData title={product?.name} />
              
              <Helmet>
    <title>{product ? `${product.name} | OnlineStore` : "Product Details"}</title>
    <meta property="og:title" content={productName} />
    <meta property="og:description" content={productDescription} />
    <meta property="og:type" content="product" />
    <meta property="og:url" content={productUrl} />
    <meta property="og:image" content={productImage} />
    <meta property="og:image:secure_url" content={productImage} />
    <meta property="og:image:alt" content={productName} />
    <meta property="og:site_name" content="OnlineStore" />
    <meta property="product:price:amount" content={product?.price ? product.price.toFixed(2) : ""} />
    <meta property="product:price:currency" content="USD" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={productName} />
    <meta name="twitter:description" content={productDescription} />
    <meta name="twitter:image" content={productImage} />
    <script type="application/ld+json">
        {JSON.stringify(productSchema)}
    </script>
</Helmet>

            <div className="row d-flex justify-content-around">
                <div className={`col-12 col-lg-5 img-fluid ${styles.productImage}`} id="product_image">
                    <div className="p-3">
                        <img
                            className="d-block w-100"
                            src={activeImg}
                            alt={product?.name}
                        />
                    </div>
                    <div className="row justify-content-start mt-5">
                        {product?.images?.map((img) => (
                            <div className={`col-2 ms-4 mt-2 ${styles.thumbnail}`} key={img.url}>
                                <button
                                    type="button"
                                    className={`d-block border rounded p-1 cursor-pointer ${img.url === activeImg ? "border-warning" : ""}`}
                                    onClick={() => setActiveImg(img.url)}
                                >
                                    <img
                                        src={img?.url}
                                        alt={product?.name}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-12 col-lg-5 mt-5">
                    <h3>{product?.name}</h3>
                    <p id="product_id">Product # {product?._id}</p>
                    <hr />
                    <div className="d-flex">
                        <StarRatings
                            rating={product?.ratings}
                            starRatedColor="#ffb829"
                            numberOfStars={5}
                            name="rating"
                            starDimension="20px"
                            starSpacing="1px"
                        />
                        <span id="no-of-reviews" className="pt-1 ps-2">({product?.numOfReviews} Reviews)</span>
                    </div>
                    <hr />
                    <p id="product_price">${product?.price?.toFixed(2)} XCD</p>
                    <div className="stockCounter d-inline">
                        <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>
                        <input
                            type="number"
                            className="form-control count d-inline"
                            value={quantity}
                            readOnly
                        />
                        <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
                    </div>
                    <button
                        type="button"
                        id="cart_btn"
                        className="btn btn-primary d-inline ms-4"
                        disabled={product?.stock <= 0}
                        onClick={setItemToCart}
                    >
                        Add to Cart
                    </button>
                          
                          <div className="d-flex flex-wrap gap-2 mt-3">
    <button
        type="button"
        className="btn btn-outline-primary d-inline-flex align-items-center"
        onClick={() => shareProduct("facebook")}
    >
        <FacebookIcon />
        Facebook
    </button>

    <button
        type="button"
        className="btn btn-outline-info d-inline-flex align-items-center"
        onClick={() => shareProduct("twitter")}
    >
        <TwitterIcon />
        Twitter
    </button>

    <button
        type="button"
        className="btn btn-outline-success d-inline-flex align-items-center"
        onClick={() => shareProduct("whatsapp")}
    >
        <WhatsAppIcon />
        WhatsApp
    </button>
</div>
                       
                    <hr />
                    <p>
                        Status: <span id="stock_status" className={product?.stock > 0 ? "greenColor" : "redColor"}>
                            {product?.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                    </p>
                    <hr />
                    <h4 className="mt-2">Description:</h4>
                    <p>{product?.description}</p>
                    <hr />
                    <p id="product_seller mb-3">Sold by: <strong>{product?.seller}</strong></p>

                    {isAuthenticated ? (
                        <NewReview productId={product?._id}/> ) : (
                        <div className="alert alert-danger my-5" role="alert">
                            Login to post your review.
                        </div>
                    )}
                </div>
            </div>

            {product?.reviews.length > 0 && <ListReviews reviews={product?.reviews} />}
        </>
    );
};

export default ProductDetails;
