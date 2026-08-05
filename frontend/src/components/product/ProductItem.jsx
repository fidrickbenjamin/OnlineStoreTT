import React from "react";
import { Link, useNavigate } from "react-router-dom";
import StarRatings from "react-star-ratings";
import "./ProductItem.css";
import Price from "../Price/Price";

const ProductItem = ({ product, columnSize }) => {
  const navigate = useNavigate();

  const isProperty =
    product?.listingType === "property" ||
    product?.category?.main === "Property or Real Estate";

  const handleCardClick = (event) => {
    // Prevent navigation when clicking buttons/links
    if (event.target.closest("a, button, input, select, textarea")) {
      return;
    }

    navigate(`/product/${product?._id}`);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(`/product/${product?._id}`);
    }
  };

  return (
    <div className={`col-sm-12 col-md-6 col-lg-${columnSize} my-3`}>
      <div
        className={`card p-3 rounded product-card ${
          isProperty ? "property-card property-card--landscape" : ""
        }`}
        data-testid="product-card"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
      >

        {/* Product Image */}
        <img
          className="card-img-top"
          src={
            product?.images?.[0]?.url ||
            "/images/default_product.png"
          }
          alt={product?.name || "Product image"}
        />

        {/* Product Information */}
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title">
              <Link to={`/product/${product?._id}`}>
                {product?.name}
              </Link>
            </h5>
                
            {isProperty && (
              <span className="badge ms-2">
                Property
              </span>
            )}
          </div>


          {/* PROPERTY LISTING */}
          {isProperty ? (
            <>
              <p className="text-muted mb-2">
                {product?.propertyDetails?.location ||
                  "Location available on request"}
              </p>


              <p className="card-text">
  <strong>
    {product?.propertyDetails?.propertyType || "Property"}
  </strong>

  {product?.propertyDetails?.propertyType?.toLowerCase() !== "land" && (
    <>
      {product?.propertyDetails?.bedrooms &&
        ` · ${product.propertyDetails.bedrooms} bed`}

      {product?.propertyDetails?.bathrooms &&
        ` · ${product.propertyDetails.bathrooms} bath`}
    </>
  )}
</p>


              <p className="card-text">
                <Price amount={product?.price} />
              </p>


              <Link
                to={`/product/${product?._id}`}
                className="btn btn-primary"
              >
                Request Details
              </Link>
            </>
          ) : (

            /* NORMAL PRODUCT */
            <>
              <div className="d-flex align-items-center">
                <StarRatings
                  rating={product?.ratings || 0}
                  starRatedColor="#ffb829"
                  numberOfStars={5}
                  name="rating"
                  starDimension="20px"
                  starSpacing="1px"
                />

                <span className="pt-2 ps-2">
                  ({product?.numOfReviews || 0})
                </span>
              </div>


              <p className="card-text mt-2">
                <Price amount={product?.price} />
              </p>


              <Link
                to={`/product/${product?._id}`}
                className="btn btn-primary"
              >
                View Details
              </Link>

            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductItem;