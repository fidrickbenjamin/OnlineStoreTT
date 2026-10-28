import HubGate from '../hubs/HubNavigation';
import React from "react";
import { Route, Navigate} from "react-router-dom";
import Home from "../Home";
import ProtectedRoute from "../auth/ProtectedRoute";

const Deals = React.lazy(() => import("../promotions/Deals"));
const ProductDetails = React.lazy(() => import("../product/ProductDetails"));
const Login = React.lazy(() => import("../auth/Login"));
const Register = React.lazy(() => import("../auth/Register"));
const Profile = React.lazy(() => import("../user/Profile"));
const UpdateProfile = React.lazy(() => import("../user/UpdateProfile"));
const PackingSlip = React.lazy(() => import("../order/PackingSlip"));
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


const FoodHub=React.lazy(()=>import("../hubs/FoodHub"));
const Restaurant=React.lazy(()=>import("../hubs/Restaurant"));
const RequestHub=React.lazy(()=>import("../hubs/RequestHub"));
const Activity=React.lazy(()=>import("../hubs/Activity"));
const BusinessCentre=React.lazy(()=>import("../hubs/BusinessCentre"));
const DriverCentre=React.lazy(()=>import("../hubs/DriverCentre"));
const userRoutes = () => {

    return (
        <> 

                    
      <Route path="/" element={<Home />} />
      <Route path="/deals" element={<Deals />} />
      <Route path="/property-hub" element={<HubGate kind="property"><PropertyHub /></HubGate>} />
      <Route path="/convenience-hub" element={<HubGate kind="convenience"><FoodHub key="convenience" kind="convenience"/></HubGate>}/>
      <Route path="/hardware-hub" element={<HubGate kind="hardware"><FoodHub key="hardware" kind="hardware"/></HubGate>}/>
      <Route path="/convenience-hub/:id" element={<HubGate kind="convenience"><Restaurant/></HubGate>}/>
      <Route path="/hardware-hub/:id" element={<HubGate kind="hardware"><Restaurant/></HubGate>}/>
      <Route path="/food-hub" element={<HubGate kind="food"><FoodHub/></HubGate>}/>
      <Route path="/food-hub/:id" element={<HubGate kind="food"><Restaurant/></HubGate>}/>
      <Route path="/ride-hub" element={<HubGate kind="ride"><RequestHub key="ride" kind="ride"/></HubGate>}/>
      <Route path="/delivery-hub" element={<HubGate kind="delivery"><RequestHub key="delivery" kind="delivery"/></HubGate>}/>
      <Route path="/me/activity" element={<ProtectedRoute><Activity/></ProtectedRoute>}/>
      <Route path="/me/activity/:id" element={<ProtectedRoute><Activity/></ProtectedRoute>}/>
      <Route path="/business-centre" element={<ProtectedRoute><BusinessCentre/></ProtectedRoute>}/>
      <Route path="/driver-centre" element={<ProtectedRoute><DriverCentre/></ProtectedRoute>}/>
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
      <Route path="/me/upload_avatar" element={<ProtectedRoute> <Navigate to="/me/update_profile" replace /> </ProtectedRoute>} />
      <Route path="/me/update_password" element={<ProtectedRoute> <UpdatePassword /> </ProtectedRoute>} />
      <Route path="/me/address" element={<ProtectedRoute> <ShippingAddress /> </ProtectedRoute>} />

      <Route path="/cart" element={<Cart />} />
      <Route path="/shipping" element={<ProtectedRoute> <Shipping /> </ProtectedRoute>} />
      <Route path="/confirm_order" element={<ProtectedRoute> <ConfirmOrder /> </ProtectedRoute>} />
      <Route path="/payment_method" element={<ProtectedRoute> <PaymentMethod /> </ProtectedRoute>} />
      <Route path="/me/orders" element={<ProtectedRoute> <MyOrders /> </ProtectedRoute>} />
      <Route path="/me/order/:id" element={<ProtectedRoute> <OrderDetails /> </ProtectedRoute>} />
      <Route path="/packing-slip/order/:id" element={<ProtectedRoute><PackingSlip/></ProtectedRoute>} />
      <Route path="/invoice/order/:id" element={<ProtectedRoute> <Invoice /> </ProtectedRoute>} />
      <Route path="/payment/shopdm/success" element={<ProtectedRoute> <ShopdmPaymentSuccess /> </ProtectedRoute>} />
      <Route path="/payment/shopdm/:orderId" element={<ProtectedRoute> <ShopdmPaymentSuccess /> </ProtectedRoute>} />
     
     
      

        </>
    );
};

export default userRoutes;
