import React, { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../../constants/constants";
import { useGetProductDetailsQuery, useUpdateProductMutation } from "../../redux/api/productsApi";

const UpdateProduct = () => {
    const navigate = useNavigate();
    const params = useParams();

    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        categoryMain: "",
        categorySub: "",
        stock: "",
        seller: "",
    });
    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    const [updateProduct, { isLoading, error, isSuccess }] = useUpdateProductMutation();
    const { data, isLoading: loadingDetails } = useGetProductDetailsQuery(params.id);

    useEffect(() => {
        if (data?.product) {
            setProduct({
                name: data.product.name,
                description: data.product.description,
                price: data.product.price,
                categoryMain: data.product.category.main,
                categorySub: data.product.category.sub,
                stock: data.product.stock,
                seller: data.product.seller,
            });
            setPreviewImages(data.product.images.map((image) => image.url));
        }

        if (error) {
            toast.error(error?.data?.message);
        }

        if (isSuccess) {
            toast.success("Product Updated");
            navigate("/admin/products");
        }
    }, [data, error, isSuccess, navigate]);

    const { name, description, price, categoryMain, categorySub, stock, seller } = product;

    const onChange = (e) => {
        const { name, value } = e.target;

        // Reset categorySub when categoryMain changes
        if (name === "categoryMain") {
            setProduct({ ...product, categoryMain: value, categorySub: "" });
        } else {
            setProduct({ ...product, [name]: value });
        }
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        const base64Promises = files.map((file) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
            })
        );

        const base64Images = await Promise.all(base64Promises);
        setImages(base64Images);
        setPreviewImages(base64Images);
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Create JSON payload with base64-encoded images
        const productData = {
            ...product,
            images,
        };

        // Call updateProduct mutation
        const response = await updateProduct({ id: params.id, body: productData });

        if (response.error) {
            toast.error(response.error.data.message);
        }
    };

    if (loadingDetails) {
        return <Loader />;
    }

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
                                required
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
                                required
                            ></textarea>
                        </div>

                        <div className="row">
                            <div className="mb-3 col">
                                <label htmlFor="price_field" className="form-label"> Price </label>
                                <input
                                    type="number"
                                    id="price_field"
                                    className="form-control"
                                    name="price"
                                    value={price}
                                    onChange={onChange}
                                    required
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
                                    required
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="mb-3 col">
                                <label htmlFor="category_main_field" className="form-label"> Main Category </label>
                                <select
                                    className="form-select"
                                    id="category_main_field"
                                    name="categoryMain"
                                    value={categoryMain}
                                    onChange={onChange}
                                    required
                                >
                                    <option value="">Select Main Category</option>
                                    {Object.keys(PRODUCT_CATEGORIES).map((mainCategory) => (
                                        <option key={mainCategory} value={mainCategory}>
                                            {mainCategory}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3 col">
                                <label htmlFor="category_sub_field" className="form-label"> Sub Category </label>
                                <select
                                    className="form-select"
                                    id="category_sub_field"
                                    name="categorySub"
                                    value={categorySub}
                                    onChange={onChange}
                                    required
                                >
                                    <option value="">Select Sub Category</option>
                                    {PRODUCT_CATEGORIES[categoryMain]?.map((subCategory) => (
                                        <option key={subCategory} value={subCategory}>
                                            {subCategory}
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
                                required
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
