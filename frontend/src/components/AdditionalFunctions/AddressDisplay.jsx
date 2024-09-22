import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AddressDisplay = () => {
    const { user } = useSelector((state) => state.auth); // Get user details from Redux store
    const [address, setAddress] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.shippingInfo) {
            // If the user is logged in and shipping info is available, construct the full address
            const fullAddress = `${user.shippingInfo.address}, ${user.shippingInfo.city}, ${user.shippingInfo.zipCode}, ${user.shippingInfo.country}`;
            setAddress(fullAddress);
        } else if (!user) {
            setAddress("Please enter your address info");
        }
    }, [user]);

    const handleLoginClick = () => {
        navigate("/login");
    };

    return (
        <div className="address-display">
            {user ? (
                // Display the address if the user is logged in
                <input
                    type="text"
                    value={address}
                    readOnly
                    className="form-control"
                    style={{ maxWidth: "200px" }}  // Adjust width as needed
                />
            ) : (
                // Show a login button if the user is not logged in
                <button
                    onClick={handleLoginClick}
                    className="btn btn-primary"
                    style={{ fontSize: "0.875rem", padding: "2px 5px", lineHeight: "1" }}
                >
                    Address Info
                </button>
            )}
        </div>
    );
};

export default AddressDisplay;
