import React, { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../../constants/constants";
import { useCreateProductMutation, useGetProductDetailsQuery, useUpdateProductMutation } from "../../redux/api/productsApi";

const UpdateProduct = () => {
    const navigate = useNavigate();
    const params = useParams();

    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        mainCategory: "",
        subCategory: "",
        stock: "",
        seller: "",
    });

    const [updateProduct, { isLoading, error, isSuccess }] = useUpdateProductMutation();
    const { data } = useGetProductDetailsQuery(params?.id);

    useEffect(() => {
        if (data?.product) {
            const categoryData = data.product.category || {};
            const mainCategory = typeof categoryData === "object" && categoryData.main ? categoryData.main : "";
            const subCategory = typeof categoryData === "object" && categoryData.sub ? categoryData.sub : "";

            setProduct({
                name: data.product.name,
                description: data.product.description,
                price: data.product.price,
                mainCategory,
                subCategory,
                stock: data.product.stock,
                seller: data.product.seller,
            });
        }

        if (error) {
            toast.error(error?.data?.message);
        }

        if (isSuccess) {
            toast.success("Product Updated");
            navigate("/admin/products");
        }
    }, [error, isSuccess, navigate, data]);

    const { name, description, price, mainCategory, subCategory, stock, seller } = product;

    const onChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();

        if (!mainCategory || !subCategory) {
            toast.error("Please select both main category and subcategory");
            return;
        }

        const updatedProduct = {
            ...product,
            category: { main: mainCategory, sub: subCategory },
            price: Number(price),
            stock: Number(stock),
        };

        updateProduct({ id: params?.id, body: updatedProduct });
    };

    return (
        <AdminLayout>
            <MetaData title={"Update Product"} />
            <div className="row wrapper">
                <div className="col-10 col-lg-10 mt-5 mt-lg-0">
                    <form className="shadow rounded bg-body" onSubmit={submitHandler}>
                        <h2 className="mb-4">Update Product</h2>

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

                        <div className="row">
                            <div className="mb-3 col">
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

                            <div className="mb-3 col">
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
                        </div>

                        <div className="mb-3">
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

                        <button type="submit" className="btn w-100 py-2" disabled={isLoading}>
                            {isLoading ? "UPDATING..." : "UPDATE"}
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UpdateProduct;