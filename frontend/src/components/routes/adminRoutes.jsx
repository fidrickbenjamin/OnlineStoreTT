import React from "react";
import { Route} from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
const Promotions = React.lazy(() => import("../admin/Promotions"));
const Dashboard = React.lazy(() => import("../admin/Dashboard"));
const ListProducts = React.lazy(() => import("../admin/ListProducts"));
const NewProduct = React.lazy(() => import("../admin/NewProduct"));
const UpdateProduct = React.lazy(() => import("../admin/UpdateProduct"));
const UploadImages = React.lazy(() => import("../admin/UploadImages"));
const ListOrders = React.lazy(() => import("../admin/ListOrders"));
const ProcessOrder = React.lazy(() => import("../admin/ProcessOrder"));
const ListUsers = React.lazy(() => import("../admin/ListUsers"));
const UpdateUser = React.lazy(() => import("../admin/UpdateUser"));
const ProductReviews = React.lazy(() => import("../admin/ProductReviews"));
const PropertyInquiries = React.lazy(() => import("../admin/PropertyInquiries"));

const adminRoutes = () => {

    return (
        < > 
        
        <Route path="/admin/promotions" element={<ProtectedRoute admin={true}><Promotions/></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute admin={true}> <Dashboard /> </ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute admin={true}> <ListProducts /> </ProtectedRoute>} />
        <Route path="/admin/product/new" element={<ProtectedRoute admin={true}> <NewProduct /> </ProtectedRoute>} />
        <Route path="/admin/products/:id" element={<ProtectedRoute admin={true}> <UpdateProduct /> </ProtectedRoute>} />
        <Route path="/admin/products/:id/upload_images" element={<ProtectedRoute admin={true}> <UploadImages /> </ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute admin={true}> <ListOrders /> </ProtectedRoute>} />
        <Route path="/admin/orders/:id" element={<ProtectedRoute admin={true}> <ProcessOrder /> </ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute admin={true}> <ListUsers /> </ProtectedRoute>} />
        <Route path="/admin/users/:id" element={<ProtectedRoute admin={true}> <UpdateUser /> </ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute admin={true}> <ProductReviews /> </ProtectedRoute>} />
        <Route path="/admin/property_inquiries" element={<ProtectedRoute admin={true}> <PropertyInquiries /> </ProtectedRoute>} />

         </>
    );
};

export default adminRoutes;
