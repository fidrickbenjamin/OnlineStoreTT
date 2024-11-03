import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import CheckoutSteps from "./CheckoutSteps";
import { calculateOrderCost } from "../../helpers/helpers";
import { useCreateNewOrderMutation, useStripeCheckoutSessionMutation } from "../../redux/api/OrderApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PaymentMethod = () => {
  const [method, setMethod] = useState("");

  const navigate = useNavigate();

  const { shippingInfo = {}, cartItems = [] } = useSelector((state) => state.cart);

  const [createNewOrder, { error, isSuccess }] = useCreateNewOrderMutation();
  const [stripeCheckoutSession, { data: checkoutData, error: checkoutError, isLoading }] =
    useStripeCheckoutSessionMutation();

  // Redirect if checkout session data is received
  useEffect(() => {
    if (checkoutData) {
      window.location.href = checkoutData?.url;
    }

    if (checkoutError) {
      toast.error(checkoutError?.data?.message);
    }
  }, [checkoutData, checkoutError]);

  // Handle order creation success or failure
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      navigate("/me/orders?order_success=true");
      toast.success("Order Completed!");
     
    }
  }, [error, isSuccess, navigate]);

  // Submit handler for payment form
  const submitHandler = (e) => {
    e.preventDefault();

    // Check if cart is empty
    if (!cartItems.length) {
      toast.error("Cart is empty");
      return;
    }

    // Validate shipping information
    if (
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.zipCode ||
      !shippingInfo.phoneNo ||
      !shippingInfo.country
    ) {
      toast.error("Please complete your shipping information before proceeding.");
      navigate("/shipping"); // Redirect to the shipping page if shippingInfo is incomplete
      return;
    }

    // Calculate order prices
    const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculateOrderCost(cartItems);

    // Create order data object
    const orderData = {
      shippingInfo,
      orderItems: cartItems,
      itemsPrice,
      shippingAmount: shippingPrice,
      taxAmount: taxPrice,
      totalAmount: totalPrice,
      paymentInfo: {
        status: method === "COD" || method === "CASH" ? "Not Paid" : "Paid",
      },
      paymentMethod: method,
    };

    // Process the order based on the selected payment method
    if (method === "COD" || method === "CASH" || method === "NBD") {
      createNewOrder(orderData);
    } else if (method === "Card") {
      stripeCheckoutSession(orderData);
    }
  };

  return (
    <>
      <MetaData title={"Payment Method"} />

      <CheckoutSteps shipping ConfirmOrder Payment />

      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow rounded bg-body" onSubmit={submitHandler}>
            <h2 className="mb-4">Select Payment Method</h2>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="codradio"
                value="COD"
                onChange={(e) => setMethod("COD")}
              />
              <label className="form-check-label" htmlFor="codradio">
                Cash on Delivery
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="cashradio"
                value="CASH"
                onChange={(e) => setMethod("CASH")}
              />
              <label className="form-check-label" htmlFor="cashradio">
                Cash Payment
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="nbdradio"
                value="NBD"
                onChange={(e) => setMethod("NBD")}
              />
              <label className="form-check-label" htmlFor="nbdradio">
                Mobanking
              </label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="cardradio"
                value="Card"
                onChange={(e) => setMethod("Card")}
              />
              <label className="form-check-label" htmlFor="cardradio">
                Card - VISA, MasterCard
              </label>
            </div>

            <button
              id="shipping_btn"
              type="submit"
              className="btn py-2 w-100"
              disabled={isLoading}
            >
              CONTINUE
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;
