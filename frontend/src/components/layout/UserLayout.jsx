import React from "react";
import SideMenu from "./SideMenu";

const UserLayout = ({children}) => {


    const menuItems = [
        {
                name: "Profile",
                url: "/me/profile",
                icon: "bi bi-person-check-fill",
        },

        {
            name:"Update Profile",
            url: "/me/update_profile",
            icon: "bi bi-person-check-fill",
        },

        {
            name:"Shipping Address",
            url: "/me/address",
            icon: "bi bi-truck",
        },

        {
            name: "Upload Avatar",
            url: "/me/upload_avatar",
            icon: "bi bi-person-bounding-box",
        },

        {
            name: "Update Password",
            url: "/me/update_password",
            icon: "bi bi-file-lock2-fill",
        },
    ];


    return (
        <div> 
            
            <div className="mt-2 mb-4 py-4">
                    <h2 className="text-center fw-bolder"> User Settings </h2>

            </div>
                        <div className="container">
                            <div className="row justify-content-around">
                                <div className="col-12 col-lg-3">
                                   <SideMenu menuItems={menuItems}/>

                                </div>
                                <div className="col-12 col-lg-8 user-dashboard">
                                    {children}
                                </div>
                            </div>
                        </div>

        </div>
    );
};

export default UserLayout;