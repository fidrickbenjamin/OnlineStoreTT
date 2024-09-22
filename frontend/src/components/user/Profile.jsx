import React, { useState } from "react";
import UserLayout from "../layout/UserLayout";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import Select from 'react-select'; // If you choose to use react-select
import countryList from 'react-select-country-list'; // For country selection

const Profile = () => {
    const { user } = useSelector((state) => state.auth);

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
                    <div className="address-info-profile">
                        <p><strong>Address:</strong> {user?.shippingInfo?.address || "N/A"}</p>
                        <p><strong>City:</strong> {user?.shippingInfo?.city || "N/A"}</p>
                        <p><strong>Zip Code:</strong> {user?.shippingInfo?.zipCode || "N/A"}</p>
                        <p><strong>Phone No:</strong> {user?.shippingInfo?.phoneNo || "N/A"}</p>
                        <p><strong>Country:</strong> {user?.shippingInfo?.country || "N/A"}</p>
                    </div>

                    {/* You can remove the form for updating address here */}
                    {/* <form onSubmit={handleAddressUpdate}>
                        ... Your form fields ...
                    </form> */}
                </div>
            </div>
        </UserLayout>
    );
};

export default Profile;
