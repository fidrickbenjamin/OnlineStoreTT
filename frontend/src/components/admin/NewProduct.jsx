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
        category: "",
        stock: "",
        seller: "",
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

    const { name, description, price, category, stock, seller } = product;

    const onChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();

        // Convert price and stock to numbers
        const newProduct = {
            ...product,
            price: Number(price),
            stock: Number(stock),
        };

        if (!category) {
            toast.error("Please select a product category");
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

                        {/* Price and Stock Inputs */}
                        <div className="row">
                            <div className="mb-3 col">
                                <label htmlFor="price_field" className="form-label"> Price </label>
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
                                <label htmlFor="stock_field" className="form-label"> Stock </label>
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

                        {/* Category and Seller Inputs */}
                        <div className="row">
                            <div className="mb-3 col">
                                <label htmlFor="category_field" className="form-label"> Category </label>
                                <select
                                    className="form-select"
                                    id="category_field"
                                    name="category"
                                    value={category}
                                    onChange={onChange}
                                >
                                    <option value="">Select Category</option>
                                    {Object.keys(PRODUCT_CATEGORIES).map((mainCategory) => (
                                        <optgroup key={mainCategory} label={mainCategory}>
                                            {PRODUCT_CATEGORIES[mainCategory].map((subCategory) => (
                                                <option key={subCategory} value={subCategory}>
                                                    {subCategory}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3 col">
                                <label htmlFor="seller_field" className="form-label"> Seller Name </label>
                                <input
                                    type="text"
                                    id="seller_field"
                                    className="form-control"
                                    name="seller"
                                    value={seller}
                                    onChange={onChange}
                                />
                            </div>
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