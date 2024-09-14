import React, { useEffect, useState } from "react";
import { useUpdateProfileMutation } from "../../redux/api/userApi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import UserLayout from "../layout/UserLayout";
import MetaData from "../layout/MetaData";
import { saveShippingInfo } from "../../redux/features/cartSlice";
 
const UpdateProfile = () => { 

    // User and shipping state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [phoneNo, setPhoneNo] = useState("");
    const [country, setCountry] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [updateProfile, { isLoading, error, isSuccess }] = useUpdateProfileMutation();

    // Access user and shipping info from Redux
    const { user } = useSelector((state) => state.auth);
    const { shippingInfo } = useSelector((state) => state.cart);

    useEffect(() => {
        if (user) {
            setName(user?.name);
            setEmail(user?.email);
        }
        if (shippingInfo) {
            setAddress(shippingInfo?.address || "");
            setCity(shippingInfo?.city || "");
            setZipCode(shippingInfo?.zipCode || "");
            setPhoneNo(shippingInfo?.phoneNo || "");
            setCountry(shippingInfo?.country || "");
        }
        if (error) {
            toast.error(error?.data?.message);
        }
        if (isSuccess) {
            toast.success("User Updated");
            navigate("/me/profile");
        }
    }, [user, shippingInfo, error, isSuccess]);

    const submitHandler = (e) => {
      e.preventDefault()

      dispatch(saveShippingInfo({ address, city, phoneNo, zipCode, country }));
      toast.success("Profile Updated");
      navigate("/me/update_profile");
  };


    return (
        <UserLayout> 
            <MetaData title={"Update Profile"} />
            <div className="row wrapper">
                <div className="col-10 col-lg-8">
                    <form className="shadow rounded bg-body" onSubmit={submitHandler}>
                        <h2 className="mb-4">Update Profile</h2>

                        <div className="mb-3">
                            <label htmlFor="name_field" className="form-label">Name</label>
                            <input
                                type="text"
                                id="name_field"
                                className="form-control"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email_field" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Shipping Info */}
                        <div className="mb-3">
                            <label htmlFor="address_field" className="form-label">Address</label>
                            <input
                                type="text"
                                id="address_field"
                                className="form-control"
                                name="address"
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
                                name="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="phone_field" className="form-label">Phone No</label>
                            <input
                                type="tel"
                                id="phone_field"
                                className="form-control"
                                name="phoneNo"
                                value={phoneNo}
                                onChange={(e) => setPhoneNo(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="zip_code_field" className="form-label">Zip Code</label>
                            <input
                                type="number"
                                id="zip_code_field"
                                className="form-control"
                                name="postalCode"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="country_field" className="form-label">Country</label>
                            <input
                                type="text"
                                id="country_field"
                                className="form-control"
                                name="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
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
