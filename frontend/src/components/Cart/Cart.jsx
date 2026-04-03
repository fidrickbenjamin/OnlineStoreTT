
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCartItem, removeCartItem } from "../../redux/features/cartSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import React, { useState } from "react";
import { calculateOrderCost } from "../../helpers/helpers";
import { setShippingOption } from "../../redux/features/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

    const {cartItems} = useSelector((state) => state.cart);

    
const increaseQty = (item, quantity) => {
  const newQty = quantity + 1;

  if(newQty > item?.stock)  return ;

  setItemToCart(item, newQty);
  toast.success("Quantity Increased Successfully!");
};

const decreaseQty = (item, quantity) => {
  const newQty = quantity - 1;

  if(newQty <= 0 )  return ;

  setItemToCart(item, newQty);
  toast.error("Quantity Reduced Successfully!");
};

const setItemToCart = (item, newQty) => {
  const cartItem = {
    product: item?.product,
    name: item?.name,
    price: item?.price,
    image: item?.image,
    stock: item?.stock,
    quantity: newQty,
  };

  dispatch(setCartItem(cartItem));
  
};

const [selectedShipping, setSelectedShipping] = useState("none");

const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
  calculateOrderCost(cartItems, selectedShipping);


const removeCartItemHandler = (id) => {
dispatch(removeCartItem(id))
};

const checkoutHandler = () => {
  navigate("/shipping");
};


return (
    <> 
    <MetaData title={"Your Cart"} />
    {cartItems?.length === 0 ? ( 
        <h2 className="mt-5">Your Cart is Empty</h2>
    ) : (
        <> 
        <h2 className="mt-5">Your Cart: <b>{cartItems?.length} items</b></h2>

<div className="row d-flex justify-content-between">
  <div className="col-12 col-lg-8">class
   {cartItems?.map((item) => (

        <> 
        <hr />
    <div className="cart-item" data-key="product1">
      <div className="row">
        <div className="col-4 col-lg-3">
          <img
            src={item?.image}
            alt="Laptop"
            height="90"
            width="115"
          />
        </div>
        <div className="col-5 col-lg-3">
          <Link to={`/products/${item?.product}`}> {item?.name} </Link>
        </div>
        <div className="col-4 col-lg-2 mt-4 mt-lg-0">
          <p id="card_item_price">${item?.price}</p>
        </div>
        <div className="col-4 col-lg-3 mt-4 mt-lg-0">
          <div className="stockCounter d-inline">
            <span className="btn btn-danger minus" onClick={() => decreaseQty(item, item.quantity)}> - </span>
            <input
              type="number"
              className="form-control count d-inline"
              value={item?.quantity}
              readonly
            />
            <span className="btn btn-primary plus" onClick={() => increaseQty(item, item.quantity)} > + </span>
          </div>
        </div>
        <div className="col-4 col-lg-1 mt-4 mt-lg-0">
          <i id="delete_cart_item" className="bi bi-trash btn btn-danger" onClick={() => removeCartItemHandler(item?.product)}></i>
        </div>
      </div>
    </div>
    <hr />
        </>    
   ))}
    

  
  </div>

  <div className="col-12 col-lg-3 my-4">
    <div id="order_summary">
      <h4>Order Summary</h4>
      <hr />
      <p>Units:{" "} <span className="order-summary-values">
          {cartItems?.reduce((acc, item) => acc + item?.quantity, 0)}   {"  "}
         (Units)</span></p>
         <p>
  Subtotal:{" "}
  <span className="order-summary-values">${itemsPrice}</span>
</p>

<p>
  Shipping:{" "}
  <span className="order-summary-values">${shippingPrice.toFixed(2)}</span>
</p>

<p>
  Tax:{" "}
  <span className="order-summary-values">${taxPrice}</span>
</p>

<hr />

<p>
  Total:{" "}
  <span className="order-summary-values">${totalPrice}</span>
</p>
      <div className="form-group mt-2">
  
  <label>Select Shipping</label>
  <select
     className="form-control"
  value={selectedShipping}
  onChange={(e) => {
    setSelectedShipping(e.target.value);
    dispatch(setShippingOption(e.target.value));
  }}>
    <option value="none">No Shipping (Pickup) - $0.00</option>
    <option value="roseau">Roseau - $15.00</option>
    <option value="portsmouth">Portsmouth - $15.00</option>
     </select>
      </div>

      <p>
  Est. total:{" "}
  <span className="order-summary-values">${totalPrice}</span>
</p>
      <hr />
      <button id="checkout_btn" className="btn btn-primary w-100" onClick={checkoutHandler}>
        Check out
      </button>
    </div>
  </div>
</div>
        </>
    )}
    
</>
);
};

export default Cart;