import React, { useState } from "react";
import UserLayout from "../layout/UserLayout";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import { useUpdateAddressMutation } from "../../redux/api/userApi"; // Ensure correct path
import toast from "react-hot-toast";
import Select from 'react-select'; // If you choose to use react-select
import countryList from 'react-select-country-list'; // For country selection

const ShippingAddress = () => {
    const { user } = useSelector((state) => state.auth);
    const [updateAddress] = useUpdateAddressMutation(); // Use the mutation hook

    // State for address fields
    const [address, setAddress] = useState(user?.shippingInfo?.address || "");
    const [city, setCity] = useState(user?.shippingInfo?.city || "");
    const [zipCode, setZipCode] = useState(user?.shippingInfo?.zipCode || "");
    const [phoneNo, setPhoneNo] = useState(user?.shippingInfo?.phoneNo || "");
    const [country, setCountry] = useState(user?.shippingInfo?.country || "");

    // Create options for country select
    const countryOptions = countryList().getData();

    // Function to handle form submission
    const handleAddressUpdate = async (e) => {
        e.preventDefault();
        const updatedInfo = { address, city, zipCode, phoneNo, country };

        try {
            await updateAddress(updatedInfo).unwrap(); // Call the mutation
            toast.success("Address updated successfully!");
        } catch (error) {
            console.error("Error updating address:", error);
            const errorMessage = error?.data?.message || error?.message || "An error occurred";
            toast.error("Failed to update address: " + errorMessage);
        }
    };

    return (
        <UserLayout>
            <MetaData title={"Shipping Address"} />
            <div className="row justify-content-around mt-5 user-info">
                <div className="col-12 col-md-6">
                    <h4>Update Shipping Address</h4>
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

export default ShippingAddress;
