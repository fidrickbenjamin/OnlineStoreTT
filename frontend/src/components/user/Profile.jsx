import React, { useState } from "react";
import UserLayout from "../layout/UserLayout";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../layout/MetaData";
import { updateAddress } from "../../redux/api/userApi"; // Assume you have an API function to update the address
import toast from "react-hot-toast";

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // State for the address fields
    const [address, setAddress] = useState(user?.shippingInfo?.address || "");
    const [city, setCity] = useState(user?.shippingInfo?.city || "");
    const [zipCode, setZipCode] = useState(user?.shippingInfo?.zipCode || "");
    const [phoneNo, setPhoneNo] = useState(user?.shippingInfo?.phoneNo || "");
    const [country, setCountry] = useState(user?.shippingInfo?.country || "");

    const handleAddressUpdate = async (e) => {
        e.preventDefault();
        
        const updatedInfo = { address, city, zipCode, phoneNo, country };
        try {
            await dispatch(updateAddress(updatedInfo));
            toast.success("Address updated successfully!");
        } catch (error) {
            toast.error("Failed to update address.");
        }
    };

    return (
        <UserLayout>
            <MetaData title={"Your Profile"} />
            <div className="row justify-content-around mt-5 user-info">
                <div className="col-12 col-md-3">
                    <figure className="avatar avatar-profile">
                        <img
                            className="rounded-circle img-fluid"
                            src={user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"}
                            alt={user?.name}
                        />
                    </figure>
                </div>

                <div className="col-12 col-md-5">
                    <h4>Full Name</h4>
                    <p>{user?.name}</p>

                    <h4>Email Address</h4>
                    <p>{user?.email}</p>

                    <h4>Joined On</h4>
                    <p>{user?.createdAt?.substring(0, 10)}</p>

                    {/* Address Information */}
                    <h4>Address Information</h4>
                    <form onSubmit={handleAddressUpdate}>
                        <div className="mb-3">
                            <label htmlFor="address_field" className="form-label">Address</label>
                            <input
                                type="text"
                                id="address_field"
                                className="form-control"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="city_field" className="form-label">City</label>
                            <input
                                type="text"
                                id="city_field"
                                className="form-control"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="zip_code_field" className="form-label">Zip Code</label>
                            <input
                                type="text"
                                id="zip_code_field"
                                className="form-control"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="phone_field" className="form-label">Phone No</label>
                            <input
                                type="text"
                                id="phone_field"
                                className="form-control"
                                value={phoneNo}
                                onChange={(e) => setPhoneNo(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="country_field" className="form-label">Country</label>
                            <input
                                type="text"
                                id="country_field"
                                className="form-control"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary w-100">
                            Update Address
                        </button>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
};

export default Profile;
