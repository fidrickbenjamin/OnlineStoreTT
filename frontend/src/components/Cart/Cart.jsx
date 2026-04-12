import MetaData from "../layout/MetaData";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCartItem, removeCartItem, setShippingOption } from "../../redux/features/cartSlice";
import toast from "react-hot-toast";
import React, { useState } from "react";
import { calculateOrderCost } from "../../helpers/helpers";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, shippingOption } = useSelector((state) => state.cart);

  // =========================
  // SHIPPING STATE (SAFE)
  // =========================
  const [selectedShipping, setSelectedShipping] = useState("");

  const validShippingOptions = ["roseau", "portsmouth", "pickup"];

  const isShippingValid = validShippingOptions.includes(selectedShipping);

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

  const increaseQty = (item, quantity) => {
    const newQty = quantity + 1;
    if (newQty > item?.stock) return;

    setItemToCart(item, newQty);
    toast.success("Quantity Increased Successfully!");
  };

  const decreaseQty = (item, quantity) => {
    const newQty = quantity - 1;
    if (newQty <= 0) return;

    setItemToCart(item, newQty);
    toast.error("Quantity Reduced Successfully!");
  };

  const removeCartItemHandler = (id) => {
    dispatch(removeCartItem(id));
  };

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
    calculateOrderCost(cartItems, selectedShipping);

  // =========================
  // CHECKOUT HANDLER (BLOCK IF INVALID)
  // =========================
  const checkoutHandler = () => {
    if (!selectedShipping) {
      toast.error("Please select a shipping option");
      return;
    }

    if (!isShippingValid) {
      toast.error("Invalid shipping option selected");
      return;
    }

    dispatch(setShippingOption(selectedShipping));

    navigate("/shipping");
  };

  return (
    <>
      <MetaData title={"Your Cart"} />

      {cartItems?.length === 0 ? (
        <h2 className="mt-5">Your Cart is Empty</h2>
      ) : (
        <>
          <h2 className="mt-5">
            Your Cart: <b>{cartItems?.length} items</b>
          </h2>

          <div className="row d-flex justify-content-between">

            {/* ================= CART ITEMS ================= */}
            <div className="col-12 col-lg-8">
              {cartItems?.map((item) => (
                <div key={item?.product}>
                  <hr />
                  <div className="cart-item">
                    <div className="row">

                      <div className="col-4 col-lg-3">
                        <img src={item?.image} alt="" height="90" width="115" />
                      </div>

                      <div className="col-5 col-lg-3">
                        <Link to={`/products/${item?.product}`}>
                          {item?.name}
                        </Link>
                      </div>

                      <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                        <p>${item?.price}</p>
                      </div>

                      <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                        <div className="stockCounter d-inline">
                          <span
                            className="btn btn-danger minus"
                            onClick={() => decreaseQty(item, item.quantity)}
                          >
                            -
                          </span>

                          <input
                            type="number"
                            className="form-control count d-inline"
                            value={item?.quantity}
                            readOnly
                          />

                          <span
                            className="btn btn-primary plus"
                            onClick={() => increaseQty(item, item.quantity)}
                          >
                            +
                          </span>
                        </div>
                      </div>

                      <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                        <i
                          className="bi bi-trash btn btn-danger"
                          onClick={() =>
                            removeCartItemHandler(item?.product)
                          }
                        ></i>
                      </div>

                    </div>
                  </div>
                  <hr />
                </div>
              ))}
            </div>

            {/* ================= ORDER SUMMARY ================= */}
            <div className="col-12 col-lg-3 my-4">
              <div id="order_summary">
                <h4>Order Summary</h4>
                <hr />

                <p>
                  Units:{" "}
                  <span className="order-summary-values">
                    {cartItems?.reduce(
                      (acc, item) => acc + item?.quantity,
                      0
                    )}
                  </span>
                </p>

                <p>
                  Subtotal:{" "}
                  <span className="order-summary-values">
                    ${itemsPrice}
                  </span>
                </p>

                <p>
                  Shipping:{" "}
                  <span className="order-summary-values">
                    ${shippingPrice.toFixed(2)}
                  </span>
                </p>

                <p>
                  Tax:{" "}
                  <span className="order-summary-values">
                    ${taxPrice.toFixed(2)}
                  </span>
                </p>

                <hr />

                <p>
                  Total:{" "}
                  <span className="order-summary-values">
                    ${totalPrice.toFixed(2)}
                  </span>
                </p>

                {/* ================= SHIPPING SELECT ================= */}
                <div className="form-group mt-2">
                  <label>Select Shipping</label>

                  <select
                    className="form-control"
                    value={selectedShipping}
                    onChange={(e) => {
                      setSelectedShipping(e.target.value);

                      if (e.target.value) {
                        dispatch(setShippingOption(e.target.value));
                      }
                    }}
                  >
                    <option value="" disabled>
                      Please select shipping option
                    </option>

                    <option value="pickup">Pickup - $0.00</option>
                    <option value="roseau">Roseau - $15.00</option>
                    <option value="portsmouth">Portsmouth - $15.00</option>
                  </select>

                  {/* 🔴 WARNING MESSAGE */}
                  {!selectedShipping && (
                    <p style={{ color: "red", marginTop: "8px" }}>
                      Please select a shipping option before checkout
                    </p>
                  )}
                </div>

                <p>
                  Est. total:{" "}
                  <span className="order-summary-values">
                    ${totalPrice.toFixed(2)}
                  </span>
                </p>

                <hr />

                <button
                  id="checkout_btn"
                  className="btn btn-primary w-100"
                  onClick={checkoutHandler}
                  disabled={!selectedShipping}
                >
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