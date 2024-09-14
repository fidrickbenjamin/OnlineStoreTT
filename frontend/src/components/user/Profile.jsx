import React, { useEffect, useState } from "react";
import UserLayout from "../layout/UserLayout";
import { useSelector, useDispatch } from "react-redux";
import MetaData from "../layout/MetaData";
import toast from "react-hot-toast";
import { useGetUserDetailsQuery, useUpdateProfileMutation } from "../../redux/api/userApi"; // Import the hooks

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Fetch user details
    const { data: userDetails, isLoading } = useGetUserDetailsQuery(user?.id); // Ensure user ID is passed
    const [updateProfile] = useUpdateProfileMutation();

    // State for the address fields
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [phoneNo, setPhoneNo] = useState("");
    const [country, setCountry] = useState("");

    // Populate fields when userDetails are loaded
    useEffect(() => {
        if (userDetails) {
            setAddress(userDetails.shippingInfo?.address || "");
            setCity(userDetails.shippingInfo?.city || "");
            setZipCode(userDetails.shippingInfo?.zipCode || "");
            setPhoneNo(userDetails.shippingInfo?.phoneNo || "");
            setCountry(userDetails.shippingInfo?.country || "");
        }
    }, [userDetails]);

    const handleAddressUpdate = async (e) => {
        e.preventDefault();
        const updatedInfo = { address, city, zipCode, phoneNo, country };

        try {
            await updateProfile(updatedInfo).unwrap();
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

                   
                </div>
            </div>
        </UserLayout>
    );
};

export default Profile;
