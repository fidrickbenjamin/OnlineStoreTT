import {useSelector} from 'react-redux';
import {fullAdmin} from '../hubs/adminAccess';
import React from "react";
import SideMenu from "./SideMenu";

const AdminLayout = ({children}) => {

    const {user}=useSelector(s=>s.auth);
    const menuItems = [
        {name:"Hub Operations",url:"/admin/hubs",icon:"bi bi-truck"},
        {name:"Appearance",url:"/admin/appearance",icon:"bi bi-palette"},
        {name:"Promotions",url:"/admin/promotions",icon:"bi bi-tags"},
        {
                name: "Dashboard",
                url: "/admin/dashboard",
                icon: "bi bi-speedometer",
        },

        {
            name:"New Product",
            url: "/admin/product/new",
            icon: "bi bi-folder-plus",
        },

        {
            name: "Products",
            url: "/admin/products",
            icon: "bi bi-box-fill",
        },

        {
            name: "Orders",
            url: "/admin/orders",
            icon: "bi bi-receipt-cutoff",
        },

        {
            name: "Users",
            url: "/admin/users",
            icon: "bi bi-person-circle",
        },

        {
            name: "Reviews",
            url: "/admin/reviews",
            icon: "bi bi-star-fill",
        },

        {
            name: "Property Inquiries",
            url: "/admin/property_inquiries",
            icon: "bi bi-chat-square-text",
        },
    ];


    return (
        <div> 
            
            <div className="mt-2 mb-4 py-4">
                    <h2 className="text-center fw-bolder"> Admin Dashboard </h2>

            </div>
                        
                            <div className="row justify-content-around">
                                <div className="col-12 col-lg-3">
                                   <SideMenu menuItems={fullAdmin(user)?menuItems:menuItems.filter(item=>item.url==='/admin/hubs')}/>

                                </div>
                                <div className="col-12 col-lg-8 user-dashboard">
                                    {children}
                                </div>
                            </div>
                        

        </div>
    );
};

export default AdminLayout;