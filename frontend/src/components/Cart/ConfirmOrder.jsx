import React from "react";
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { calculateOrderCost } from "../../helpers/helpers";
import CheckoutSteps from "./CheckoutSteps";
import Price from "../Price/Price";


const ConfirmOrder = () => {


    const { cartItems, shippingInfo, shippingOption } = useSelector((state) => state.cart);
    const {user } = useSelector((state) => state.auth);


  const {
  itemsPrice,
  taxPrice,
  totalPrice,
} = calculateOrderCost(cartItems, shippingOption);
  

    const ready = ["roseau", "portsmouth", "pickup"].includes(shippingOption) && shippingInfo?.address && shippingInfo?.city && shippingInfo?.phoneNo && cartItems.length > 0;

    return (
        <>
     <MetaData title={"Confirm Order Info"} />
     <CheckoutSteps shipping ConfirmOrder />
        <div className="row d-flex justify-content-between">
        <div className="col-12 col-lg-8 mt-5 order-confirm">
          <h4 className="mb-3">Shipping Info</h4>
          <p><b>Name:</b> {user?.name}</p>
          <p><b>Email:</b> {user?.email}</p>
          <p><b>Phone:</b> {shippingInfo?.phoneNo}</p>
          <p className="mb-4">
            <b>Address:</b> {shippingInfo?.address}, {shippingInfo?.city}, {shippingInfo?.zipCode}, {shippingInfo?.country}
          </p>
  
          <hr />
          <h4 className="mt-4">Your Cart Items:</h4>
          <p>Landmark: {shippingInfo?.landmark || "Not provided"}</p>
          {shippingInfo?.deliveryNotes && <p>Delivery notes: {shippingInfo.deliveryNotes}</p>}
          <p>Delivery or collection time will be confirmed by the store.</p>
  
            {cartItems?.map((item) => (
                <React.Fragment key={item.product}> 
                <hr />
          <div className="cart-item my-1">
            <div className="row">
              <div className="col-4 col-lg-2">
                <img
                  src={item?.image}
                  alt="Laptop"
                  height="45"
                  width="65"
                />
              </div>
  
              <div className="col-5 col-lg-6">
                <Link to ={`/product/${item.product}`}>{item?.name}</Link>
              </div>
  
              <div className="col-4 col-lg-4 mt-4 mt-lg-0">
                <p>{item?.quantity} x $ {item?.price}  = <Price amount={Number(item.price) * item.quantity} size="small"/> </p>
              </div>
            </div>
          </div>
          <hr />
                </React.Fragment>
            ))}

          
        </div>
  
        <div className="col-12 col-lg-3 my-4">
          <div id="order_summary">
            <h4>Order Summary</h4>
            <hr />
<p>Subtotal: <span className="order-summary-values"> <Price amount={itemsPrice}/> </span></p>
            <hr />
            <p>Tax: <span className="order-summary-values"> <Price amount={taxPrice}/> </span></p>
            <hr />
            <p> Delivery: <span className="order-summary-values"> {" "} {shippingOption === "roseau" ? "Roseau Delivery ($15)" : shippingOption === "portsmouth" ? "Portsmouth Delivery ($15)" : "Pickup ($0)"}
</span> </p>
            
  
            <hr />

            <p>Total: <span className="order-summary-values"> <Price amount={totalPrice} /> </span></p>
  
            <hr />
            <Link to={ready ? "/payment_method" : "/shipping"} id="checkout_btn" className="btn btn-primary w-100" >
              {ready ? "Proceed to Payment" : "Complete shipping details"}
            </Link>
          </div>
        </div>
      </div>
      </>
    );
};

export default ConfirmOrder;