import React, { useEffect, useState } from "react";
import { useUpdateProfileMutation } from "../../redux/api/userApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import UserLayout from "../layout/UserLayout";
import MetaData from "../layout/MetaData";
import { countries } from "countries-list";

const UpdateProfile = () => { 
    const [user, setUser] = useState({
        name: "",
        email: "",
        address: "",
        city: "",
        zipCode: "",
        phoneNo: "",
        country: ""
    });

    const { name, email, address, city, zipCode, phoneNo, country } = user;

    const navigate = useNavigate();
    const [updateProfile, { isLoading, error, isSuccess }] = useUpdateProfileMutation();
    const { user: currentUser } = useSelector((state) => state.auth);
    
    const countriesList = Object.values(countries);

    useEffect(() => {
        if (currentUser) {
            setUser({
                name: currentUser?.name,
                email: currentUser?.email,
                address: currentUser?.shippingAddresses[0]?.address || "", // Assuming you want the first address
                city: currentUser?.shippingAddresses[0]?.city || "",
                zipCode: currentUser?.shippingAddresses[0]?.zipCode || "",
                phoneNo: currentUser?.shippingAddresses[0]?.phoneNo || "",
                country: currentUser?.shippingAddresses[0]?.country || "",
            });
        }
        if (error) {
            toast.error(error?.data?.message);
        }
        if (isSuccess) {
            toast.success("User Updated");
            navigate("/me/profile");
        }
    }, [currentUser, error, isSuccess]);

    const submitHandler = (e) => {
        e.preventDefault();

        const userData = {
            name,
            email,
            shippingAddresses: [{
                address,
                city,
                zipCode,
                phoneNo,
                country,
            }],
        };

        updateProfile(userData);
    };

    const onChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <UserLayout> 
            <MetaData title={"Update Profile "} />
            <div className="row wrapper">
                <div className="col-10 col-lg-8">
                    <form className="shadow rounded bg-body" onSubmit={submitHandler}>
                        <h2 className="mb-4">Update Profile</h2>

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
                            <label htmlFor="email_field" className="form-label"> Email </label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name="email"
                                value={email}
                                onChange={onChange}
                            />
                        </div>

                        {/* Shipping Info Fields */}
                        <h3 className="mb-4">Shipping Information</h3>

                        <div className="mb-3">
                            <label htmlFor="address_field" className="form-label"> Address </label>
                            <input
                                type="text"
                                id="address_field"
                                className="form-control"
                                name="address"
                                value={address}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="city_field" className="form-label"> City </label>
                            <input
                                type="text"
                                id="city_field"
                                className="form-control"
                                name="city"
                                value={city}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="zip_code_field" className="form-label"> Zip Code </label>
                            <input
                                type="text"
                                id="zip_code_field"
                                className="form-control"
                                name="zipCode"
                                value={zipCode}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="phone_field" className="form-label"> Phone No </label>
                            <input
                                type="text"
                                id="phone_field"
                                className="form-control"
                                name="phoneNo"
                                value={phoneNo}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="country_field" className="form-label"> Country </label>
                            <select
                                id="country_field"
                                className="form-select"
                                name="country"
                                value={country}
                                onChange={onChange}
                            >
                                {countriesList.map((country) => (
                                    <option key={country.name} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="btn update-btn w-100" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update"}
                        </button>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
};

export default UpdateProfile;
