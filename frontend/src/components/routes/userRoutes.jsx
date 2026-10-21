import React from "react";
import { Route} from "react-router-dom";
import Home from "../Home";
import ProtectedRoute from "../auth/ProtectedRoute";

const Deals = React.lazy(() => import("../promotions/Deals"));
const ProductDetails = React.lazy(() => import("../product/ProductDetails"));
const Login = React.lazy(() => import("../auth/Login"));
const Register = React.lazy(() => import("../auth/Register"));
const Profile = React.lazy(() => import("../user/Profile"));
const UpdateProfile = React.lazy(() => import("../user/UpdateProfile"));
const UploadAvatar = React.lazy(() => import("../user/UploadAvatar"));
const UpdatePassword = React.lazy(() => import("../user/UpdatePassword"));
const ForgotPassword = React.lazy(() => import("../auth/ForgotPassword"));
const ResetPassword = React.lazy(() => import("../auth/ResetPassword"));
const Cart = React.lazy(() => import("../Cart/Cart"));
const Shipping = React.lazy(() => import("../Cart/Shipping"));
const ConfirmOrder = React.lazy(() => import("../Cart/ConfirmOrder"));
const PaymentMethod = React.lazy(() => import("../Cart/PaymentMethod"));
const MyOrders = React.lazy(() => import("../order/MyOrders"));
const OrderDetails = React.lazy(() => import("../order/OrderDetails"));
const Invoice = React.lazy(() => import("../invoice/Invoice"));
const PropertyHub = React.lazy(() => import("../property/PropertyHub"));
const ShippingAddress = React.lazy(() => import("../user/ShippingAddress"));
const ShopdmPaymentSuccess = React.lazy(() => import("../payment/ShopdmPaymentSuccess"));


const userRoutes = () => {

    return (
        <> 

                    
      <Route path="/" element={<Home />} />
      <Route path="/deals" element={<Deals />} />
      <Route path="/property-hub" element={<PropertyHub />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset/:token" element={<ResetPassword />} />

      <Route path="/me/profile" element={
        <ProtectedRoute> 
      <Profile />
      </ProtectedRoute>
      } />

      <Route path="/me/update_profile" element={<ProtectedRoute> <UpdateProfile /> </ProtectedRoute>} />
      <Route path="/me/upload_avatar" element={<ProtectedRoute> <UploadAvatar /> </ProtectedRoute>} />
      <Route path="/me/update_password" element={<ProtectedRoute> <UpdatePassword /> </ProtectedRoute>} />
      <Route path="/me/address" element={<ProtectedRoute> <ShippingAddress /> </ProtectedRoute>} />

      <Route path="/cart" element={<Cart />} />
      <Route path="/shipping" element={<ProtectedRoute> <Shipping /> </ProtectedRoute>} />
      <Route path="/confirm_order" element={<ProtectedRoute> <ConfirmOrder /> </ProtectedRoute>} />
      <Route path="/payment_method" element={<ProtectedRoute> <PaymentMethod /> </ProtectedRoute>} />
      <Route path="/me/orders" element={<ProtectedRoute> <MyOrders /> </ProtectedRoute>} />
      <Route path="/me/order/:id" element={<ProtectedRoute> <OrderDetails /> </ProtectedRoute>} />
      <Route path="/invoice/order/:id" element={<ProtectedRoute> <Invoice /> </ProtectedRoute>} />
      <Route path="/payment/shopdm/success" element={<ProtectedRoute> <ShopdmPaymentSuccess /> </ProtectedRoute>} />
      <Route path="/payment/shopdm/:orderId" element={<ProtectedRoute> <ShopdmPaymentSuccess /> </ProtectedRoute>} />
     
     
      

        </>
    );
};

export default userRoutes;
