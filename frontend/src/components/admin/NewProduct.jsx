import React, { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../../constants/constants";
import { useCreateProductMutation } from "../../redux/api/productsApi";

const NewProduct = () => {
    const navigate = useNavigate();

    // State Initialization
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        mainCategory: "",
        subCategory: "",
        stock: "",
        seller: "",
        listingType: "retail",
        propertyType: "",
        location: "",
        bedrooms: "",
        bathrooms: "",
        sizeSqft: "",
        yearBuilt: "",
        listingStatus: "For Sale",
    });

    const [createProduct, { isLoading, error, isSuccess }] = useCreateProductMutation();

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message || "An error occurred");
        }

        if (isSuccess) {
            toast.success("Product Created");
            navigate("/admin/products");
        }
    }, [error, isSuccess, navigate]);

    const { name, description, price, mainCategory, subCategory, stock, seller, listingType, propertyType, location, bedrooms, bathrooms, sizeSqft, yearBuilt, listingStatus } = product;

    const onChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();

        const newProduct = {
            ...product,
            category: { main: mainCategory, sub: subCategory },
            price: Number(price),
            stock: Number(stock),
            listingType,
            propertyDetails: listingType === "property" ? {
                propertyType,
                location,
                bedrooms: bedrooms ? Number(bedrooms) : undefined,
                bathrooms: bathrooms ? Number(bathrooms) : undefined,
                sizeSqft: sizeSqft ? Number(sizeSqft) : undefined,
                yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
                listingStatus,
                inquiryOnly: true,
            } : undefined,
        };

        if (!mainCategory || !subCategory) {
            toast.error("Please select both main category and subcategory");
            return;
        }

        createProduct(newProduct);
    };

    return (
        <AdminLayout>
            <MetaData title={"Create New Product"} />
            <div className="row wrapper">
                <div className="col-10 col-lg-10 mt-5 mt-lg-0">
                    <form className="shadow rounded bg-body" onSubmit={submitHandler}>
                        <h2 className="mb-4">New Product</h2>

                        {/* Product Name Input */}
                        <div className="mb-3">
                            <label htmlFor="name_field" className="form-label"> Name </label>
                            <input
                                type="text"
                                id="name_field"
                                className="form-control"
                                name="name"
                                value={name}
                                onChange={onChange}
                            />
                        </div>

                        {/* Product Description Input */}
                        <div className="mb-3">
                            <label htmlFor="description_field" className="form-label"> Description </label>
                            <textarea
                                className="form-control"
                                id="description_field"
                                rows="8"
                                name="description"
                                value={description}
                                onChange={onChange}
                            ></textarea>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="listingType_field" className="form-label">Listing Type</label>
                            <select
                                className="form-select"
                                id="listingType_field"
                                name="listingType"
                                value={listingType}
                                onChange={(e) => setProduct({ ...product, listingType: e.target.value })}
                            >
                                <option value="retail">Retail / Standard Product</option>
                                <option value="property">Property / Real Estate Listing</option>
                            </select>
                        </div>

                        {/* Price and Stock Inputs */}
                        <div className="row">
                            <div className="mb-3 col">
                                <label htmlFor="price_field" className="form-label">
                                    {listingType === "property" ? "Price / Asking Price" : "Price"}
                                </label>
                                <input
                                    type="text"
                                    id="price_field"
                                    className="form-control"
                                    name="price"
                                    value={price}
                                    onChange={onChange}
                                />
                            </div>

                            <div className="mb-3 col">
                                <label htmlFor="stock_field" className="form-label">
                                    {listingType === "property" ? "Inventory / Reference" : "Stock"}
                                </label>
                                <input
                                    type="number"
                                    id="stock_field"
                                    className="form-control"
                                    name="stock"
                                    value={stock}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        {listingType === "property" && (
                            <div className="border rounded p-3 mb-3" style={{ background: "#fcf6f1" }}>
                                <h5 className="mb-3">Property Details</h5>
                                <div className="row">
                                    <div className="mb-3 col-md-6">
                                        <label htmlFor="propertyType_field" className="form-label">Property Type</label>
                                        <select
                                            className="form-select"
                                            id="propertyType_field"
                                            name="propertyType"
                                            value={propertyType}
                                            onChange={onChange}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="House">House</option>
                                            <option value="Apartment">Apartment</option>
                                            <option value="Land">Land</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Townhouse">Townhouse</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="mb-3 col-md-6">
                                        <label htmlFor="listingStatus_field" className="form-label">Listing Status</label>
                                        <select
                                            className="form-select"
                                            id="listingStatus_field"
                                            name="listingStatus"
                                            value={listingStatus}
                                            onChange={onChange}
                                        >
                                            <option value="For Sale">For Sale</option>
                                            <option value="For Rent">For Rent</option>
                                            <option value="Sold">Sold</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="mb-3 col-md-6">
                                        <label htmlFor="location_field" className="form-label">Location</label>
                                        <input type="text" className="form-control" id="location_field" name="location" value={location} onChange={onChange} />
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label htmlFor="bedrooms_field" className="form-label">Bedrooms</label>
                                        <input type="number" className="form-control" id="bedrooms_field" name="bedrooms" value={bedrooms} onChange={onChange} />
                                    </div>
                                    <div className="mb-3 col-md-3">
                                        <label htmlFor="bathrooms_field" className="form-label">Bathrooms</label>
                                        <input type="number" className="form-control" id="bathrooms_field" name="bathrooms" value={bathrooms} onChange={onChange} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="mb-3 col-md-6">
                                        <label htmlFor="sizeSqft_field" className="form-label">Size (sqft)</label>
                                        <input type="number" className="form-control" id="sizeSqft_field" name="sizeSqft" value={sizeSqft} onChange={onChange} />
                                    </div>
                                    <div className="mb-3 col-md-6">
                                        <label htmlFor="yearBuilt_field" className="form-label">Year Built</label>
                                        <input type="number" className="form-control" id="yearBuilt_field" name="yearBuilt" value={yearBuilt} onChange={onChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Category Input */}
                        <div className="mb-3">
                            <label htmlFor="mainCategory_field" className="form-label">Main Category</label>
                            <select
                                className="form-select"
                                id="mainCategory_field"
                                name="mainCategory"
                                value={mainCategory}
                                onChange={(e) => {
                                    setProduct({ ...product, mainCategory: e.target.value, subCategory: "" });
                                }}
                            >
                                <option value="">Select Main Category</option>
                                {Object.keys(PRODUCT_CATEGORIES).map((mainCat) => (
                                    <option key={mainCat} value={mainCat}>
                                        {mainCat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subcategory Input */}
                        <div className="mb-3">
                            <label htmlFor="subCategory_field" className="form-label">Subcategory</label>
                            <select
                                className="form-select"
                                id="subCategory_field"
                                name="subCategory"
                                value={subCategory}
                                onChange={onChange}
                                disabled={!mainCategory}
                            >
                                <option value="">Select Subcategory</option>
                                {mainCategory &&
                                    PRODUCT_CATEGORIES[mainCategory].map((subCat) => (
                                        <option key={subCat} value={subCat}>
                                            {subCat}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Seller Input */}
                        <div className="mb-3">
                            <label htmlFor="seller_field" className="form-label">Seller Name</label>
                            <input
                                type="text"
                                id="seller_field"
                                className="form-control"
                                name="seller"
                                value={seller}
                                onChange={onChange}
                            />
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn w-100 py-2" disabled={isLoading}>
                            {isLoading ? "CREATING..." : "CREATE"}
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default NewProduct;