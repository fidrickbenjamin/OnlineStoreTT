import {useHubQuery} from '../../redux/api/hubApi';
import {useDeliveryOptionsQuery} from "../../redux/api/OrderApi";
import MetaData from "../layout/MetaData";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCartItem, removeCartItem, setShippingOption } from "../../redux/features/cartSlice";
import toast from "react-hot-toast";
import React, { useState } from "react";
import { calculateOrderCost } from "../../helpers/helpers";
import Price from "../Price/Price";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, shippingOption } = useSelector((state) => state.cart);

  // =========================
  // SHIPPING STATE (SAFE)
  // =========================
  const [selectedShipping, setSelectedShipping] = useState(shippingOption!=="none"?shippingOption:"");

  const {data:deliveryData,isLoading:deliveryLoading,error:deliveryError,refetch:reloadDelivery}=useDeliveryOptionsQuery(undefined,{refetchOnMountOrArgChange:true});
  const {data:directory,isLoading:directoryLoading,error:directoryError,refetch:reloadDirectory}=useHubQuery('/delivery-directory',{refetchOnMountOrArgChange:true});
  const communityMode=!!directory?.enabled;
  const deliveryOptions=deliveryData?.options||{};
  const checkoutShipping=communityMode&&selectedShipping&&selectedShipping!=='pickup'&&!selectedShipping.startsWith('quote-')?'community':selectedShipping;
  const validShippingOptions = Object.keys(deliveryOptions);

  const isShippingValid = communityMode?Boolean(checkoutShipping==='pickup'||checkoutShipping==='community'||/^quote-[a-f\d]{24}$/.test(checkoutShipping)):validShippingOptions.includes(selectedShipping);

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

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
    calculateOrderCost(cartItems, selectedShipping,deliveryOptions);

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

    dispatch(setShippingOption(checkoutShipping));

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

                <p>
                  Shipping:{" "}
                  <span className="order-summary-values">
                    {communityMode?(checkoutShipping==='pickup'?<Price amount={0}/>:<span>Calculated at checkout</span>):<Price amount={shippingPrice} />}
                  </span>
                </p>

                <p>
                  Tax:{" "}
                  <span className="order-summary-values">
                     {communityMode?<span>Calculated at checkout</span>:<Price amount={taxPrice} />}
                  </span>
                </p>

                <hr />

                <p>
                  Total:{" "}
                  <span className="order-summary-values">
                   {communityMode?<span>Calculated at checkout</span>:<Price amount={totalPrice} />}
                  </span>
                </p>

                {/* ================= SHIPPING SELECT ================= */}
                <div className="form-group mt-2">
                  <label htmlFor="cart-shipping">Select delivery or collection</label>

                  <select
                    id="cart-shipping"
                    className="form-control"
                    value={isShippingValid?(communityMode&&checkoutShipping!=='pickup'?'community':selectedShipping):''}
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

                    {communityMode?<><option value="pickup">Collect my order — free collection</option><option value="community">Deliver to my community — price at checkout</option></>:Object.entries(deliveryOptions).map(([key,value])=><option key={key} value={key}>{value.label} — XCD {Number(value.fee).toFixed(2)}</option>)}
                  </select>

                  {directoryLoading&&<p role="status">Loading checkout settings…</p>}{directoryError&&<p role="alert">Checkout settings could not be loaded. <button type="button" onClick={reloadDirectory}>Retry</button></p>}{deliveryLoading&&<p role="status">Loading delivery coverage…</p>}{deliveryError&&<p role="alert">Delivery options could not be loaded. <button type="button" onClick={reloadDelivery}>Retry</button></p>}
                  {communityMode?<p className="mt-3">{checkoutShipping==='pickup'?directory.collectionInstructions:'Choose your recipient and village on the next screen. We calculate the route fee there; unpriced destinations can request a delivery quote before payment.'}</p>:<><p className="mt-3">{deliveryOptions[selectedShipping]?.instructions}</p><p className="text-muted">Only the communities listed for an option are covered by its fee. Delivery is confirmed after review.</p><details><summary>See covered communities</summary><ul>{Object.entries(deliveryOptions).filter(([key])=>key!=='pickup').map(([key,v])=><li key={key}>{v.label}: {v.communities?.join(', ')}</li>)}</ul></details><p className="mt-2">Your community is not listed? <Link to="/help/delivery">Ask for a delivery quote before ordering</Link>.</p>
</>}
                  {/* Shipping validation */}
                  {!selectedShipping && (
                    <p style={{ color: "red", marginTop: "8px" }}>
                      Please select a shipping option before checkout
                    </p>
                  )}
                </div>

                <p>
                  Est. total:{" "}
                  <span className="order-summary-values">
                   {communityMode?<span>Calculated at checkout</span>:<Price amount={totalPrice} />}
                  </span>
                </p>

                <hr />

                <button
                  id="checkout_btn"
                  className="btn btn-primary w-100"
                  onClick={checkoutHandler}
                  disabled={!isShippingValid||directoryLoading||!!directoryError||(!communityMode&&(deliveryLoading||!!deliveryError))}
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