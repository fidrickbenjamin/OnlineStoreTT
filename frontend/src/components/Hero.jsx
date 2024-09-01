// src/components/Hero.js
import React, { useEffect, useState } from 'react';
import { useGetProductsQuery } from '../redux/api/productsApi';
import './Hero.css'; // Import the CSS file

const Hero = () => {
  const [randomProducts, setRandomProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data, isLoading, isError } = useGetProductsQuery({ page: 1, keyword: "" });

  useEffect(() => {
    if (!isLoading && !isError && data && data.products) {
      const products = [...data.products];
      const shuffled = products.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      setRandomProducts(selected);
    }
  }, [data, isLoading, isError]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % randomProducts.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, [randomProducts]);

  if (isLoading) return <div className="hero-loading">Loading hero images...</div>;
  if (isError) return <div className="hero-error">Error loading products</div>;

  return (
    <section id="hero" className="hero-section">
      <div className="hero-container">
        {randomProducts.length > 0 ? (
          <div className="hero-item">
            <img
              src={randomProducts[currentIndex].images[0].url}
              alt={randomProducts[currentIndex].name}
            />
            <div className="hero-overlay">
              <p className="price">${randomProducts[currentIndex].price.toFixed(2)}</p>
              <a
                href={`/product/${randomProducts[currentIndex]._id}`} // Ensure this URL matches your route configuration
                className="btn"
              >
                View Product
              </a>
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
