import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import CheckoutSteps from "./CheckoutSteps";
import { calculateOrderCost } from "../../helpers/helpers";
import { useCreateNewOrderMutation, useStripeCheckoutSessionMutation } from "../../redux/api/OrderApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PayPalButton } from "react-paypal-button-v2";
import axios from "axios";

const PaymentMethod = () => {
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { shippingInfo = {}, cartItems = [], shippingOption } = useSelector((state) => state.cart);

  const [createNewOrder, { error, isSuccess }] = useCreateNewOrderMutation();
  const [stripeCheckoutSession, { data: checkoutData, error: checkoutError }] = useStripeCheckoutSessionMutation();

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculateOrderCost(cartItems, shippingOption);

  useEffect(() => {
    if (checkoutData) window.location.href = checkoutData?.url;
    if (checkoutError) toast.error(checkoutError?.data?.message);
  }, [checkoutData, checkoutError]);

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (isSuccess) {
      navigate("/me/orders?order_success=true");
      toast.success("Order Completed!");
    }
  }, [error, isSuccess, navigate]);

  const submitHandler = async (selectedMethod) => {
    setMethod(selectedMethod);

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
      shippingOption,
      orderItems: cartItems,
      itemsPrice,
      shippingAmount: shippingPrice,
      taxAmount: taxPrice,
      totalAmount: totalPrice,
      paymentInfo: {
        status:
          selectedMethod === "COD" || selectedMethod === "CASH"
            ? "Not Paid"
            : selectedMethod === "NBD"
            ? "Verifying"
            : "Paid",
      },
      paymentMethod: selectedMethod,
    };

    setLoading(true);

    try {
      if (["COD", "CASH", "NBD"].includes(selectedMethod)) {
        await createNewOrder(orderData).unwrap();
      } else if (selectedMethod === "Card") {
        await stripeCheckoutSession(orderData).unwrap();
      } else if (selectedMethod === "FISERV") {
        const cardNumber = prompt("Enter card number");
        const expiry = prompt("Enter expiry MM/YY");
        const cvv = prompt("Enter CVV");

        const response = await axios.post("/api/v2/payment/fiserv", {
          ...orderData,
          cardNumber,
          expiry,
          cvv,
          userId: "userIdHere",
        });

        if (response.data.success) {
          toast.success("Payment successful! Order placed.");
          navigate("/me/orders?order_success=true");
        } else {
          toast.error("Payment failed: " + (response.data.message || ""));
        }
      } else if (selectedMethod === "PayPal") {
        setLoading(false);
        return; // PayPal handled separately
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      if (selectedMethod !== "PayPal") setLoading(false);
    }
  };

  const handlePaypalSuccess = async (details, data) => {
    const orderData = {
      shippingInfo,
      shippingOption,
      orderItems: cartItems,
      itemsPrice,
      shippingAmount: shippingPrice,
      taxAmount: taxPrice,
      totalAmount: totalPrice,
      paymentInfo: { id: data.orderID, status: "Paid" },
      paymentMethod: "PayPal",
    };

    await createNewOrder(orderData);
    navigate("/me/orders?order_success=true");
    toast.success(`Transaction completed by ${details.payer.name.given_name}`);
  };

  const buttonStyles = {
    COD: { backgroundColor: "#8593ff", color: "#000000" },
    CASH: { backgroundColor: "#FFB84D", color: "#000000" },
    NBD: { backgroundColor: "#66bb66", color: "#000000" },
    Card: { backgroundColor: "#555555", color: "#ffffff" }, // Stripe stays white
    FISERV: { backgroundColor: "#4da6ff", color: "#000000" },
    PayPal: { backgroundColor: "#ffc439", color: "#000000" },
  };

  const baseStyle = {
    borderRadius: "50px",
    padding: "12px 25px",
    fontSize: "16px",
    fontWeight: "700", // Bold text
    border: "none",
    cursor: "pointer",
    width: "100%",
    maxWidth: "300px",
    marginBottom: "10px",
    transition: "all 0.3s ease",
  };

  return (
    <>
      <MetaData title={"Payment Method"} />
      <CheckoutSteps shipping ConfirmOrder Payment />

      <div className="row wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div className="col-10 col-lg-5 shadow rounded bg-light p-4 mb-4">
          <h4 className="text-center">Mobanking Information</h4>
          <p><strong>Account Name:</strong> Fidrick Benjamin</p>
          <p><strong>Account Number:</strong> 600400420</p>
          <p><strong>Mobile Id:</strong> 7672858487</p>
          <p><strong>Bank Name:</strong> National Bank of Dominica</p>
          <p>Please ensure you verify all details before proceeding with your payment.</p>
          <p>${totalPrice.toFixed(2)} USD</p>
          <p> ${shippingPrice.toFixed(2)} - {shippingOption}  </p>
          <p>Order total: {(totalPrice * 2.67).toFixed(2)} XCD</p>
        </div>

        <div className="col-10 col-lg-5">
          <div className="shadow rounded bg-body p-4">
            <h2 className="mb-4 text-center">Select Payment Method</h2>
            <div className="d-flex flex-column align-items-center">
              {["COD", "CASH", "NBD", "Card", "FISERV", "PayPal"].map((m) => (
                <button
                  key={m}
                  onClick={() => submitHandler(m)}
                  disabled={loading}
                  style={{ ...baseStyle, ...buttonStyles[m] }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = 0.85)}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
                >
                  {m === "COD" ? "Cash on Delivery" :
                   m === "CASH" ? "Cash Payment" :
                   m === "NBD" ? "Mobanking" :
                 //  m === "Card" ? "Pay with Stripe" :
                   m === "FISERV" ? "Pay with Fiserv" :
                   "Pay with PayPal"}
                </button>
              ))}

              {method === "PayPal" && (
                <div style={{ marginTop: "10px", width: "100%", maxWidth: "300px" }}>
                  <PayPalButton
                    amount={totalPrice.toFixed(2)}
                    onSuccess={handlePaypalSuccess}
                    options={{
                      clientId: "ARi7SuAhS8m8CEw6CU-YNXcehZBt83cyyE27RCwKvVdW_tykWQEqpsmbBdvepVGCa2itqafM3LKGEQbV",
                      currency: "USD",
                    }}
                  />
                </div>
              )}
            </div>

            {loading && <div className="text-center mt-3">Processing...</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;