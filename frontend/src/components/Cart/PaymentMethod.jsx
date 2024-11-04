import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import CheckoutSteps from "./CheckoutSteps";
import { calculateOrderCost } from "../../helpers/helpers";
import { useCreateNewOrderMutation, useStripeCheckoutSessionMutation } from "../../redux/api/OrderApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PayPalButton } from "react-paypal-button-v2";
import { useStripe } from "@stripe/react-stripe-js";

const PaymentMethod = () => {
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false); // State to manage loading
  const navigate = useNavigate();
  const { shippingInfo = {}, cartItems = [] } = useSelector((state) => state.cart);

  const [createNewOrder, { error, isSuccess }] = useCreateNewOrderMutation();
  const [stripeCheckoutSession, { data: checkoutData, error: checkoutError, isLoading }] = useStripeCheckoutSessionMutation();

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculateOrderCost(cartItems);

  useEffect(() => {
    if (checkoutData) {
      window.location.href = checkoutData?.url;
    }
    if (checkoutError) {
      toast.error(checkoutError?.data?.message);
    }
  }, [checkoutData, checkoutError]);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }
    if (isSuccess) {
      navigate("/me/orders?order_success=true");
      toast.success("Order Completed!");
    }
  }, [error, isSuccess, navigate]);

  const submitHandler = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!cartItems.length) {
      toast.error("Cart is empty");
      return;
    }

    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.zipCode || !shippingInfo.phoneNo || !shippingInfo.country) {
      toast.error("Please complete your shipping information before proceeding.");
      navigate("/shipping");
      return;
    }

    const orderData = {
      shippingInfo,
      orderItems: cartItems,
      itemsPrice,
      shippingAmount: shippingPrice,
      taxAmount: taxPrice,
      totalAmount: totalPrice,
      paymentInfo: { status: method === "COD" || method === "CASH" ? "Not Paid" : "Paid" },
      paymentMethod: method,
    };

    setLoading(true); // Set loading to true when processing starts

    try {
      if (method === "COD" || method === "CASH" || method === "NBD") {
        await createNewOrder(orderData).unwrap();
      } else if (method === "Card") {
        await stripeCheckoutSession(orderData).unwrap();
      }
    } catch (error) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false); // Reset loading state after processing
    }
  };

  const handlePaypalSuccess = async (details, data) => {
    const orderData = {
      shippingInfo,
      orderItems: cartItems,
      itemsPrice,
      shippingAmount: shippingPrice,
      taxAmount: taxPrice,
      totalAmount: totalPrice,
      paymentInfo: { id: data.orderID, status: "Paid" },
      paymentMethod: "Card",
    };

    await createNewOrder(orderData);
    navigate("/me/orders?order_success=true");
    toast.success(`Transaction completed by ${details.payer.name.given_name}`);
  };

  const handleMethodSelectAndSubmit = (selectedMethod) => {
    setMethod(selectedMethod);
    if (selectedMethod === "PayPal") {
      // Directly render PayPal button when PayPal is selected
      submitHandler(); // Invoke submit handler to create order data
    } else {
    const syntheticEvent = {
      preventDefault: () => {},
    };
    submitHandler(syntheticEvent);
  }
  };

  return (
    <>
      <MetaData title={"Payment Method"} />
      <CheckoutSteps shipping ConfirmOrder Payment />

      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <div className="shadow rounded bg-body">
            <h2 className="mb-4 text-center">Select Payment Method</h2>

            <div className="btn-group-vertical" role="group" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <button type="button" className="btn btn-outline-primary mb-2" onClick={() => handleMethodSelectAndSubmit("COD")} disabled={loading}
              style={{
                backgroundColor: "#6772e5",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "4px",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                width: "auto"
              }} >
                Cash on Delivery
              </button>
              <button type="button" className="btn btn-outline-primary mb-2" onClick={() => handleMethodSelectAndSubmit("CASH")} disabled={loading}
                style={{
                  backgroundColor: "#FFA500",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  width: "auto"
                }} >
                Cash Payment
              </button>
              <button type="button" className="btn btn-outline-primary mb-2" onClick={() => handleMethodSelectAndSubmit("NBD")} disabled={loading}
                style={{
                  backgroundColor: "#008000",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  width: "auto"
                }}>
                Mobanking
              </button>
             {/*} <button type="button" className="btn btn-outline-primary mb-2" onClick={() => handleMethodSelectAndSubmit("Card")} disabled={loading}>
                Card - VISA, MasterCard
              </button> {*/}
              <button 
                type="button" 
                className="btn btn-stripe mb-2" 
                onClick={() => handleMethodSelectAndSubmit("Card")} 
                disabled={loading}
                style={{
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  width: "auto"
                }}
              >
                Pay with Stripe
              </button>
          {/*}    <button type="button" className="btn btn-outline-primary mb-2" onClick={() => handleMethodSelectAndSubmit("PayPal")} disabled={loading}
              style={{
                backgroundColor: "#012169",
                color: "#ffffff",
                padding: "10px 20px",
                borderRadius: "4px",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                width: "auto"
              }} >
                PayPal
              </button> {*/}
              <PayPalButton
              onClick={() => handleMethodSelectAndSubmit("PayPal")} disabled={loading}
                  amount={totalPrice}
                  onSuccess={handlePaypalSuccess}
                  options={{
                    clientId: "ARi7SuAhS8m8CEw6CU-YNXcehZBt83cyyE27RCwKvVdW_tykWQEqpsmbBdvepVGCa2itqafM3LKGEQbV",
                    currency: "USD",
                  }}
                />
            </div>

            {loading && <div className="text-center">Processing...</div>} {/* Loading indicator */}

        {/*}    {method === "PayPal" && (
              <div className="form-check">
                <PayPalButton
                  amount={totalPrice}
                  onSuccess={handlePaypalSuccess}
                  options={{
                    clientId: "AXTD4mxaPsiwqyYqIsZsTAWptnbkpehTbE1vFnCnhJcz6SjbgODtfM4vbiYzbDF5Wyi0-AUS9kIDeLC5",
                    currency: "USD",
                  }}
                />
              </div>
            )} {*/}

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;
