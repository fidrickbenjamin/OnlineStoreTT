// ProductItem.js
import React from "react";
import { Link } from "react-router-dom";
import StarRatings from "react-star-ratings";
import './ProductItem.css'; // Import the CSS file

const ProductItem = ({ product, columnSize }) => {
  return (
    <div className={`col-sm-12 col-md-6 col-lg-${columnSize} my-3`}>
      <div className="card p-3 rounded product-card">
        <img
          className="card-img-top"
          src={product?.images[0] ? product?.images[0]?.url : "/images/default_product.png"}
          alt={product?.name}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">
            <Link to={`/product/${product?._id}`}>{product?.name}</Link>
          </h5>
          <StarRatings 
            rating={product?.ratings}
            starRatedColor="#ffb829"
            numberOfStars={5}
            name="rating"
            starDimension="20px"
            starSpacing="1px"
          />
          <span className="pt-2 ps-2">({product?.numOfReviews})</span>
          <p className="card-text mt-2">${product?.price?.toFixed(2)}</p>
          <Link to={`/product/${product?._id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
