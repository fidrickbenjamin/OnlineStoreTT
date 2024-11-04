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
    const { data } = useGetProductDetailsQuery(params?.id);

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
            setPreviewImages(data.product.images.map(image => image.url));
        }

        if (error) {
            toast.error(error?.data?.message);
        }

        if (isSuccess) {
            toast.success("Product Updated");
            navigate("/admin/products");
        }
    }, [error, isSuccess, navigate, data]);

    const { name, description, price, categoryMain, categorySub, stock, seller } = product;

    const onChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        const filePreviews = files.map((file) => URL.createObjectURL(file));
        setPreviewImages(filePreviews);
    };

    const submitHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category.main", categoryMain);
        formData.append("category.sub", categorySub);
        formData.append("stock", stock);
        formData.append("seller", seller);
        
        images.forEach((image) => formData.append("images", image));

        updateProduct({ id: params?.id, body: formData });
    };

    return (
        <AdminLayout>
            <MetaData title={"Update Product"} />
            <div className="row wrapper">
                <div className="col-10 col-lg-10 mt-5 mt-lg-0">
                    <form className="shadow rounded bg-body" onSubmit={submitHandler} encType="multipart/form-data">
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
                                    type="number"
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
                                <label htmlFor="category_main_field" className="form-label"> Main Category </label>
                                <select
                                    className="form-select"
                                    id="category_main_field"
                                    name="categoryMain"
                                    value={categoryMain}
                                    onChange={onChange}
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
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="images_field" className="form-label"> Images </label>
                            <input
                                type="file"
                                id="images_field"
                                className="form-control"
                                name="images"
                                onChange={handleImageChange}
                                multiple
                            />
                            <div className="image-preview mt-2">
                                {previewImages.map((img, idx) => (
                                    <img key={idx} src={img} alt="Preview" width="100" height="100" className="me-2" />
                                ))}
                            </div>
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
