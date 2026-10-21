import React, { useEffect, useState } from "react";
import MetaData from "./layout/MetaData";
import { useGetProductsQuery } from "../redux/api/productsApi";
import ProductItem from "./product/ProductItem";
import Loader from "./layout/Loader";
import toast from "react-hot-toast";
import CustomPagination from "./layout/CustomPagination";
import { Link, useSearchParams } from "react-router-dom";
import Filters from "./layout/Filters";
import Hero from "./Hero";
import PromotionBanners from "./promotions/PromotionBanners";
import CategorySplash from "./CategorySplash";
import { useSelector } from "react-redux";
import "./shared/store-upgrade.css";

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { cartItems = [] } = useSelector(state => state.cart);

  const page = searchParams.get("page") || 1;
  const keyword = searchParams.get("keyword") || "";
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const category = searchParams.get("category");
  const ratings = searchParams.get("ratings");

  const params = {
    page,
    keyword,
    listingType: "retail",
    sort: searchParams.get("sort") || "newest",
    inStock: searchParams.get("inStock") || "",
  };

  if (min !== null) params.min = min;
  if (max !== null) params.max = max;
  if (category !== null) params.category = category;
  if (ratings !== null) params.ratings = ratings;

  const { data, isLoading, error, isError } = useGetProductsQuery(params, {pollingInterval:60000,refetchOnMountOrArgChange:true});

  const retailProducts = (data?.products || []).filter((product) => {
    const isProperty =
      product?.listingType === "property" ||
      product?.category?.main === "Property or Real Estate";

    return !isProperty;
  });

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  }, [isError, error]);

  // Detect if any filter/search is active
  const hasActiveFilters = Boolean(
    keyword || category || min || max || ratings || searchParams.get("inStock")
  );

  // Use larger cards whenever filters are visible
  const columnSize = hasActiveFilters ? 4 : 3;

  const headingLabel = category
    ? category
    : ratings
    ? `${ratings} star${
        Number(ratings) === 1 ? "" : "s"
      }${Number(ratings) < 5 ? " or more" : ""}`
    : keyword || "";

  const headingText = headingLabel
    ? category
      ? `${data?.filteredProductsCount || 0} Products in ${headingLabel}`
      : ratings
      ? `${data?.filteredProductsCount || 0} Products with ${headingLabel}`
      : `${data?.filteredProductsCount || 0} Products found with keyword: ${headingLabel}`
    : "Latest Products";

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title={"Tactical Trends Market Place"} />

      {!hasActiveFilters && <><CategorySplash /><Hero /></>}
      <PromotionBanners/>
      <div className="tt-toolbar"><Link className="btn btn-success" to="/deals">Shop deals</Link><button className="btn btn-outline-success" onClick={() => setFiltersOpen(value => !value)} aria-expanded={filtersOpen}>Filters</button><label>Sort<select value={params.sort} onChange={event => { const next = new URLSearchParams(searchParams); next.set("sort", event.target.value); next.set("page", "1"); setSearchParams(next); }}><option value="newest">Newest</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option><option value="rating">Highest rated</option></select></label><label><input type="checkbox" checked={params.inStock === "true"} onChange={event => { const next = new URLSearchParams(searchParams); if (event.target.checked) next.set("inStock", "true"); else next.delete("inStock"); next.set("page", "1"); setSearchParams(next); }} style={{display:"inline", marginRight:8}}/> In stock only</label><button className="btn btn-outline-secondary" onClick={() => setSearchParams({})}>Clear filters</button></div>
      {filtersOpen && <div className="tt-filter-panel"><Filters /></div>}

      <div className="row">
        {hasActiveFilters && !filtersOpen && (
          <div className="col-12 col-md-3 mt-5 hide-on-mobile">
            <Filters />
          </div>
        )}

        <div
          className={`${
            hasActiveFilters && !filtersOpen ? "col-12 col-md-9" : "col-12"
          } products-container filters-products-container`}
        >
          <h1 id="products_heading" className="text-secondary">
            {headingText}
          </h1>

          <section id="products" className="mt-4 tt-product-grid">
            {!retailProducts.length && <p className="tt-empty">No products match these filters. Try a wider search.</p>}
            <div className="row">
              {retailProducts.map((product) => (
                <ProductItem
                  key={product._id}
                  product={product}
                  columnSize={columnSize}
                />
              ))}
            </div>
          </section>

          <CustomPagination
            resPerPage={data?.resPerPage}
            filteredProductsCount={data?.filteredProductsCount}
          />
        </div>
      </div>
      {cartItems.length > 0 && <Link to="/cart" className="tt-mobile-cart">Cart · {cartItems.reduce((sum, item) => sum + Number(item.quantity), 0)} items</Link>}
    </>
  );
};

export default Home;