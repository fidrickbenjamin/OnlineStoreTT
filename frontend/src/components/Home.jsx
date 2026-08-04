import React, { useEffect } from "react";
import MetaData from "./layout/MetaData";
import { useGetProductsQuery } from "../redux/api/productsApi";
import ProductItem from "./product/ProductItem";
import Loader from "./layout/Loader";
import toast from "react-hot-toast";
import CustomPagination from "./layout/CustomPagination";
import { useSearchParams } from "react-router-dom";
import Filters from "./layout/Filters";
import Hero from "./Hero";
import CategorySplash from "./CategorySplash";


const Home = () => {

  let [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  const keyword = searchParams.get("keyword") || "";
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const category = searchParams.get("category");
  const ratings = searchParams.get("ratings");

  const params = { page, keyword };

  min !== null && (params.min = min);
  max !== null && (params.max = max);
  category !== null && (params.category = category);
  ratings !== null && (params.ratings = ratings);



  

 const {data, isLoading, error, isError} = useGetProductsQuery(params);
 const retailProducts = (data?.products || []).filter((product) => {
   const isProperty = product?.listingType === "property" || product?.category?.main === "Property or Real Estate";
   return !isProperty;
 });

      useEffect(() => {
          if(isError) {
              toast.error(error?.data?.message);
          }
      }, [isError] );

      const columnSize = keyword ? 4 : 3; 
      const hasActiveFilters = Boolean(keyword || category || min || max || ratings);

      const headingLabel = category
        ? category
        : ratings
          ? `${ratings} star${Number(ratings) === 1 ? "" : "s"}${Number(ratings) < 5 ? " or more" : ""}`
          : keyword || "";

      const headingText = headingLabel
        ? category
          ? `${retailProducts.length} Products in ${headingLabel}`
          : ratings
            ? `${retailProducts.length} Products with ${headingLabel}`
            : `${retailProducts.length} Products found with keyword: ${headingLabel}`
        : "Latest Products";

 if(isLoading) return <Loader />;





    return (
      <> 
      <MetaData title={"Tactical Trends Market Place"} />
      <CategorySplash />
     <Hero />
  
      <div className="row">
     
        {hasActiveFilters && (
          <div className="col-6 col-md-3 mt-5 hide-on-mobile"> 
          <Filters />
          </div>
        ) }
        <div className={keyword? "col-12 col-sm-6 col-md-9 products-container filters-products-container" : "col-12 col-sm-6 col-md-12 products-container filters-products-container"}>
          <h1 id="products_heading" className="text-secondary"  >
            
            {headingText}
            
            </h1>

          <section id="products" className="mt-5">
            <div className="row">
              {retailProducts.map((product) => (
                <ProductItem  product={product} columnSize={columnSize} />
              ))}
              
              
            
            </div>
          </section>
              
          <CustomPagination resPerPage={data?.resPerPage} filteredProductsCount={data?.filteredProductsCount} />
        </div>
      </div>
   </>
    );
};

export default Home;