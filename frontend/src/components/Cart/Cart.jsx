import MetaData from "../layout/MetaData";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCartItem, removeCartItem } from "../../redux/features/cartSlice";
import toast from "react-hot-toast";
import React from "react";
import Price from "../Price/Price";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);

  // =========================
  // SHIPPING STATE (SAFE)
  // =========================
  const setItemToCart = (item, newQty) => {
    const cartItem = {
      ...item,
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

  const itemsPrice=cartItems.reduce((sum,item)=>sum+Number(item.price)*item.quantity,0);
  const checkoutHandler=()=>navigate('/shipping');

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

          <p className="text-muted">Prices and active offers are checked again on the order review page before payment.</p>
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
                        <Link to={`/product/${item?.product}`}>
                          {item?.name}
                        </Link>{item.purchaseUnit&&<p className="text-muted">Per {item.purchaseUnit}</p>}
                      </div>

                      <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                        <p> <Price amount={item?.price} /> </p>
                        
                      </div>

                      <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                        <div className="stockCounter d-inline">
                          <button type="button" aria-label={`Decrease ${item.name} quantity`}
                            className="btn btn-danger minus"
                            onClick={() => decreaseQty(item, item.quantity)}
                          >
                            -
                          </button>

                          <input
                            aria-label={`Quantity for ${item.name}`}
                            type="number"
                            className="form-control count d-inline"
                            value={item?.quantity}
                            readOnly
                          />

                          <button type="button" aria-label={`Increase ${item.name} quantity`}
                            className="btn btn-primary plus"
                            onClick={() => increaseQty(item, item.quantity)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                        <button type="button" aria-label={`Remove ${item.name}`}
                          className="bi bi-trash btn btn-danger"
                          onClick={() =>
                            removeCartItemHandler(item?.product)
                          }
                        ></button>
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
                     <Price amount={itemsPrice} />
                  </span>
                </p>

                <p className="text-muted">Delivery, applicable tax and the final total are calculated after choosing an address or self collection at checkout.</p>
                <hr />

                <button
                  id="checkout_btn"
                  className="btn btn-primary w-100"
                  onClick={checkoutHandler}
                  disabled={!cartItems.length}
                >
                  Continue to checkout
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