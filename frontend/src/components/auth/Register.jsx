import React, { useEffect, useState } from "react";
import { useRegisterMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";

const Register = () => {
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        city: "",
        zipCode: "",
        phoneNo: "",
        country: ""
    });

    const { name, email, password, address, city, zipCode, phoneNo, country } = user;

    const navigate = useNavigate();

    const [register, { isLoading, error }] = useRegisterMutation();

    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
        if (error) {
            toast.error(error?.data?.message);
        }
    }, [error, isAuthenticated]);

    const submitHandler = (e) => {
        e.preventDefault();

        const signUpData = {
            name,
            email,
            password,
            address,
            city,
            zipCode,
            phoneNo,
            country
        };

        register(signUpData);
    };

    const onChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <>
            <MetaData title={"Register"} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form
                        className="shadow rounded bg-body"
                        onSubmit={submitHandler}
                    >
                        <h2 className="mb-4">Register</h2>

                        <div className="mb-3">
                            <label htmlFor="name_field" className="form-label">
                                Name
                            </label>
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
                            <label htmlFor="email_field" className="form-label">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                name="email"
                                value={email}
                                onChange={onChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password_field" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password_field"
                                className="form-control"
                                name="password"
                                value={password}
                                onChange={onChange}
                            />
                        </div>

                        {/* Address Fields */}
                        <div className="mb-3">
                            <label htmlFor="address_field" className="form-label">
                                Address
                            </label>
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
                            <label htmlFor="city_field" className="form-label">
                                City
                            </label>
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
                            <label htmlFor="zip_code_field" className="form-label">
                                Zip Code
                            </label>
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
                            <label htmlFor="phone_field" className="form-label">
                                Phone No
                            </label>
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
                            <label htmlFor="country_field" className="form-label">
                                Country
                            </label>
                            <input
                                type="text"
                                id="country_field"
                                className="form-control"
                                name="country"
                                value={country}
                                onChange={onChange}
                            />
                        </div>

                        <button
                            id="register_button"
                            type="submit"
                            className="btn w-100 py-2"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "REGISTER"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Register;
