// src/components/Hero.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../redux/api/productsApi';
import './Hero.css'; // Import the CSS file
import Price from '../components/Price/Price'; // Import the Price component
import { useIsMobile } from './hooks/useIsMobile';

const Hero = () => {
  const [randomProducts, setRandomProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isMobile = useIsMobile();

  const { data, isLoading, isError } = useGetProductsQuery({ page: 1, keyword: "" });

  useEffect(() => {
    if (!isLoading && !isError && data && data.products) {
      const retailProducts = data.products.filter((product) => {
        const isProperty = product?.listingType === "property" || product?.category?.main === "Property or Real Estate";
        return !isProperty;
      });
      const shuffled = [...retailProducts].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      setRandomProducts(selected);
    }
  }, [data, isLoading, isError]);

  useEffect(() => {
    if (randomProducts.length < 2) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % randomProducts.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, [randomProducts]);

  const activeProduct = randomProducts[currentIndex] || randomProducts[0];

  if (isLoading) return <div className="hero-loading">Loading hero images...</div>;
  if (isError) return <div className="hero-error">Error loading products</div>;

  

  return (
    <section id="hero" className="hero-section">
      <div className="hero-container">
        {activeProduct ? (
          <div className="hero-item">
            <img
              src={activeProduct.images?.[0]?.url || "/images/default_product.png"}
              alt={activeProduct.name}
            />
            <div className="hero-overlay">
              <div className="price">
                <Price
                  amount={activeProduct.price}
                  size={isMobile ? "medium" : "hero"}
                />
              </div>
              <div className="hero-actions">
                <a
                  href={`/product/${activeProduct._id}`}
                  className="btn"
                >
                  View Product
                </a>
                {!isMobile && (
                  <Link to="/property-hub" className="btn btn-outline-light">
                    Explore Property Hub
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="hero-no-products">No products available</div>
        )}
      </div>
    </section>
  );
};

export default Hero;
