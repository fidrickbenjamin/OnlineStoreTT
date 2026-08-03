import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../../constants/constants";
import StarRatings from "react-star-ratings";

const Filters = () => {

    const [min, setMin] = useState("");
    const [max, setMax] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
      setMin(searchParams.get("min") || "");
      setMax(searchParams.get("max") || "");
    }, [searchParams]);
   
    const handleClick = (checkbox) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const filterName = checkbox.name;

      nextParams.delete(filterName);

      if (checkbox.checked) {
        nextParams.set(filterName, checkbox.value);
      }

      nextParams.set("page", "1");
      setSearchParams(nextParams);
    };

    const handleButtonClick = (e) => {
      e.preventDefault();

      const nextParams = new URLSearchParams(searchParams.toString());

      if (min) {
        nextParams.set("min", min);
      } else {
        nextParams.delete("min");
      }

      if (max) {
        nextParams.set("max", max);
      } else {
        nextParams.delete("max");
      }

      nextParams.set("page", "1");
      setSearchParams(nextParams);
    };

    const defaultCheckHandler = (checkboxType, checkboxValue) => {
      const value = searchParams.get(checkboxType);
      return checkboxValue === value;
    };

    return (
        <div className="border p-3 filter">
        <h3>Filters</h3>
        <hr />
        <h5 className="filter-heading mb-3">Price</h5>
        <form
          id="filter_form"
          className="px-2"
          onSubmit={handleButtonClick}
        >
          <div className="row">
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Min ($)"
                name="min"
                value={min}
                onChange={(e) => setMin(e.target.value)}
              />
            </div>
            <div className="col">
              <input
                type="text"
                className="form-control"
                placeholder="Max ($)"
                name="max"
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </div>
            <div className="col">
              <button type="submit" className="btn btn-primary">GO</button>
            </div>
          </div>
        </form>
        <hr />
        <h5 className="mb-3">Category</h5>
  
         {/* Map over PRODUCT_CATEGORIES object */}
         {Object.keys(PRODUCT_CATEGORIES).map((category) => (
                <div key={category}>
                    <h6>{category}</h6>

                    {/* Display subcategories for each main category */}
                    {PRODUCT_CATEGORIES[category].map((subCategory) => (
                        <div className="form-check" key={subCategory}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                name="category"
                                value={subCategory}
                                checked={defaultCheckHandler("category", subCategory)}
                                onChange={(e) => handleClick(e.target)}
                            />
                            <label className="form-check-label">
                                {subCategory}
                            </label>
                        </div>
                    ))}
                </div>
            ))}
  
        <hr />
        <h5 className="mb-3">Ratings</h5>
          
          {[5,4,3,2,1].map((rating) => (
                  <div className="form-check" key={rating}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="ratings"
                    id={`rating-${rating}`}
                    value={rating}
                    checked={defaultCheckHandler("ratings", rating?.toString())}
                    onChange={(e) => handleClick(e.target)}
                  />
                  <label className="form-check-label" htmlFor={`rating-${rating}`}>
                  <StarRatings 
                      rating={rating}
                      StarRatedColor="#ffb829"
                      numberOfStars={5}
                      name="rating"
                      starDimension="20px"
                      starSpacing="1px"
                   />
                  </label>
                </div>
          ))}

        
      
      </div>
    );
};

export default Filters;