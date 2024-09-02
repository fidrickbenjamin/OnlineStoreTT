import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AddressDisplay = () => {
    const { user } = useSelector((state) => state.auth);
    const { shippingInfo } = useSelector((state) => state.cart);
    const [address, setAddress] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (shippingInfo) {
                const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zipCode}, ${shippingInfo.country}`;
                setAddress(fullAddress);
            } else {
                setAddress("");
            }
        } else {
            setAddress("Login to enter your address info");
        }
    }, [user, shippingInfo]);

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    const saveAddress = async () => {
        if (user && address !== "Enter your address info here" && address !== "Login to enter your address info") {
            // Logic to save the address to the user's account
            console.log("Saving address:", address);
            // Example: dispatch action to save the address via an API call
            // dispatch(saveUserAddress(address));
        }
    };

    const handleLoginClick = () => {
        navigate("/login");
    };

    return (
        <div className="address-display">
            {user ? (
                <input
                    type="text"
                    value={address}
                    onChange={handleAddressChange}
                    onBlur={saveAddress}
                    placeholder="Click to add your address"
                    className="form-control"
                    style={{ maxWidth: "200px" }}  // Adjust width as needed
                />
            ) : (
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
