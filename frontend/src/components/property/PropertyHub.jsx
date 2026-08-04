import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import { useGetProductsQuery } from "../../redux/api/productsApi";
import ProductItem from "../product/ProductItem";

const PropertyHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeType, setActiveType] = useState(searchParams.get("propertyType") || "All");
  const [activeStatus, setActiveStatus] = useState(searchParams.get("status") || "All");

  const params = useMemo(() => ({
    page: searchParams.get("page") || 1,
    keyword: searchParams.get("keyword") || "",
    category: "Property or Real Estate",
  }), [searchParams]);

  const { data, isLoading, error, isError } = useGetProductsQuery(params);

  useEffect(() => {
    setActiveType(searchParams.get("propertyType") || "All");
    setActiveStatus(searchParams.get("status") || "All");
  }, [searchParams]);

  const propertyListings = useMemo(() => {
    const listings = data?.products || [];
    return listings.filter((product) => {
      const propertyDetails = product?.propertyDetails || {};
      const matchesType = activeType === "All" || propertyDetails.propertyType === activeType;
      const matchesStatus = activeStatus === "All" || propertyDetails.listingStatus === activeStatus;
      return matchesType && matchesStatus;
    });
  }, [activeType, activeStatus, data]);

  const updateFilters = (nextType, nextStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (nextType && nextType !== "All") params.set("propertyType", nextType); else params.delete("propertyType");
    if (nextStatus && nextStatus !== "All") params.set("status", nextStatus); else params.delete("status");
    setSearchParams(params);
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <MetaData title="Property Hub | Tactical Trends" />
      <div className="py-3 py-md-4">
        <div className="row align-items-stretch mb-4 g-3">
          <div className="col-12 col-lg-8">
            <div className="rounded-4 p-3 p-sm-4 p-lg-5 shadow-sm" style={{ background: "linear-gradient(135deg, #4b2e2b 0%, #6f3d72 55%, #8b5a3c 100%)", color: "#fff" }}>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="badge rounded-pill bg-white text-dark">Property Hub</span>
                <span className="badge rounded-pill bg-white/20">Inquiry-first marketplace</span>
              </div>
              <h2 className="mb-2 fw-bold fs-3 fs-md-2">Discover premium homes and spaces</h2>
              <p className="mb-0 opacity-75" style={{ maxWidth: 720 }}>
                Browse real-estate listings, request details, and arrange viewings without a direct online purchase flow.
              </p>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="rounded-4 p-3 p-sm-4 h-100 shadow-sm border" style={{ background: "#f7efe9", borderColor: "#e5d7ca" }}>
              <h5 className="fw-semibold mb-2" style={{ color: "#4b2e2b" }}>Why this section feels different</h5>
              <p className="mb-0 text-muted small">
                This hub focuses on viewing, inquiry, and trusted property conversations rather than instant checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div className="rounded-4 p-3 shadow-sm border" style={{ background: "#fcf6f1", borderColor: "#e9d9cb" }}>
              <h5 className="mb-3 fw-semibold" style={{ color: "#4b2e2b" }}>Property Type</h5>
              <div className="d-flex flex-wrap gap-2">
                {['All', 'House', 'Apartment', 'Land', 'Commercial', 'Villa', 'Townhouse'].map((type) => (
                  <button
                    key={type}
                    className={`btn btn-sm rounded-pill ${activeType === type ? 'btn-dark' : 'btn-outline-dark'}`}
                    style={activeType === type ? { background: "#4b2e2b", borderColor: "#4b2e2b" } : { borderColor: "#6f3d72", color: "#6f3d72" }}
                    onClick={() => {
                      const nextType = type;
                      setActiveType(nextType);
                      updateFilters(nextType, activeStatus);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="rounded-4 p-3 shadow-sm border" style={{ background: "#fcf6f1", borderColor: "#e9d9cb" }}>
              <h5 className="mb-3 fw-semibold" style={{ color: "#4b2e2b" }}>Listing Status</h5>
              <div className="d-flex flex-wrap gap-2">
                {['All', 'For Sale', 'For Rent', 'Pending'].map((status) => (
                  <button
                    key={status}
                    className={`btn btn-sm rounded-pill ${activeStatus === status ? 'btn-dark' : 'btn-outline-dark'}`}
                    style={activeStatus === status ? { background: "#4b2e2b", borderColor: "#4b2e2b" } : { borderColor: "#6f3d72", color: "#6f3d72" }}
                    onClick={() => {
                      const nextStatus = status;
                      setActiveStatus(nextStatus);
                      updateFilters(activeType, nextStatus);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isError ? (
          <div className="alert alert-danger rounded-4">{error?.data?.message || "Unable to load property listings right now."}</div>
        ) : propertyListings.length === 0 ? (
          <div className="alert alert-secondary rounded-4">No matching property listings found yet.</div>
        ) : (
          <div className="row g-3">
            {propertyListings.map((product) => (
              <ProductItem key={product._id} product={product} columnSize={4} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyHub;
