import React, { useEffect, useState } from "react";
import { useUpdateProfileMutation } from "../../redux/api/userApi";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import UserLayout from "../layout/UserLayout";
import MetaData from "../layout/MetaData";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
    const [user, setUser] = useState({
        name: "",
        email: ""
    });

    const navigate = useNavigate();
    
    const [updateProfile, { isLoading, error, isSuccess }] = useUpdateProfileMutation();
    const { user: currentUser } = useSelector((state) => state.auth);
    
    // State to track if success message has been shown
    const [messageShown, setMessageShown] = useState(false);

    // Populate the form fields when the component loads
    useEffect(() => {
        if (currentUser) {
            setUser({
                name: currentUser?.name,
                email: currentUser?.email
            });
        }

        if (error) {
            toast.error(error?.data?.message);
        }

        if (isSuccess && !messageShown) {
            toast.success("Profile Updated");
            setMessageShown(true); // Mark the message as shown
            navigate("/me/update_profile");
        }
    }, [currentUser, error, isSuccess, messageShown]);

    // Handler for form submission
    const submitHandler = (e) => {
        e.preventDefault();
        updateProfile(user); // Update profile with name and email
        setMessageShown(false); // Reset message shown state for future updates
    };

    // Handler for input changes
    const onChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <UserLayout>
            <MetaData title={"Update Profile"} />
            <div className="row wrapper">
                <div className="col-10 col-lg-8">
                    {/* Form for Name and Email */}
                    <form className="shadow rounded bg-body mb-4" onSubmit={submitHandler}>
                        <h2 className="mb-4">Update Profile</h2>

                        {/* Name and Email Section */}
                        <div className="mb-3">
                            <label htmlFor="name_field" className="form-label"> Name </label>
                            <input
                                type="text"
                                id="name_field"
                                className="form-control"
                                name="name"
                                value={user.name}
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
                                value={user.email}
                                onChange={onChange}
                            />
                        </div>

                        {/* Submit Button for Name and Email */}
                        <button type="submit" className="btn update-btn w-100" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Name & Email"}
                        </button>
                    </form>
                </div>
            </div>
        </UserLayout>
    );
};

export default UpdateProfile;
