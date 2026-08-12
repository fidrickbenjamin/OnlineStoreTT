import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import CheckoutSteps from "./CheckoutSteps";
import { calculateOrderCost } from "../../helpers/helpers";
import { useCreateNewOrderMutation, useShopdmCheckoutMutation } from "../../redux/api/OrderApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ShopdmPay from "../payment/ShopdmPay";
import Price from "../Price/Price";

const PaymentMethod = () => {
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBankingModal, setShowBankingModal] = useState(false);
  const navigate = useNavigate();

  const { shippingInfo = {}, cartItems = [], shippingOption } =
    useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [createNewOrder, { error, isSuccess }] = useCreateNewOrderMutation();
  const [shopdmCheckout, {
    isLoading: isShopdmLoading
}] = useShopdmCheckoutMutation();
  // const [shopdmCheckout, { error: shopdmError, isSuccess: shopdmSuccess }] = useShopdmCheckoutMutation();


  const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
    calculateOrderCost(cartItems, shippingOption);

  // ✅ VALID OPTIONS (must match backend schema)
  const validShippingOptions = ["roseau", "portsmouth", "pickup"];

  // ❌ DO NOT silently default — force user selection
  const isShippingValid =
    validShippingOptions.includes(shippingOption);

 useEffect(() => { 
  if (error) { 
    toast.error( 
      error?.data?.message || 
      "Unable to create order." 
    ); 
  } 
}, [error]);

  // =============================
  // BUILD ORDER
  // =============================
  const buildOrderData = (selectedMethod, paymentInfo = {}) => ({
    shippingInfo,
    shippingOption, // ✅ send ONLY if valid
    orderItems: cartItems,
    itemsPrice,
    shippingAmount: shippingPrice,
    taxAmount: taxPrice,
    totalAmount: totalPrice,
    paymentInfo,
    paymentMethod: selectedMethod,
  });

  // =============================
  // MAIN HANDLER
  // =============================
 
const submitHandler = async (selectedMethod) => {
    setMethod(selectedMethod);

    if (!cartItems.length) {
        toast.error("Cart is empty");
        return;
    }

    if (
        !shippingInfo.address ||
        !shippingInfo.city ||
        !shippingInfo.zipCode ||
        !shippingInfo.phoneNo ||
        !shippingInfo.country
    ) {
        toast.error("Please complete shipping information");
        navigate("/shipping");
        return;
    }

    if (!isShippingValid) {
        toast.error("Please select a shipping option before continuing");
        navigate("/shipping");
        return;
    }

    setLoading(true);

    try {
        if (["COD", "CASH", "NBD", "ShopdmPay"].includes(selectedMethod)) {

            const paymentInfo =
                selectedMethod === "NBD"
                    ? { status: "Verifying" }
                    : selectedMethod === "ShopdmPay"
                    ? {
                        status: "Pending",
                        note: "Shopdm Pay pending confirmation",
                    }
                    : { status: "Not Paid" };

            // Build the order using your existing function
            const orderData = buildOrderData(
                selectedMethod,
                paymentInfo
            );

            // Create the order and KEEP the response
            const result = await createNewOrder(orderData).unwrap();

            // ==========================================
            // SHOPDM PAY
            // ==========================================
            if (selectedMethod === "ShopdmPay") {

                if (!result?.success || !result?.order?._id) {
                    throw new Error(
                        "Order was created but no order ID was returned."
                    );
                }

                const orderId = result.order._id;

                // Ask backend to generate the signed Shopdm URL
                const payment = await shopdmCheckout({
                    orderId,
                }).unwrap();

                if (!payment?.checkoutUrl) {
                    throw new Error(
                        "Shopdm payment URL was not returned."
                    );
                }

                // Send customer to Shopdm Pay
                window.location.href = payment.checkoutUrl;

                return;
            }

            // ==========================================
            // OTHER PAYMENT METHODS
            // ==========================================
            navigate("/me/orders?order_success=true");
            toast.success("Order Completed!");
        }

    } catch (err) {
        console.error("Payment processing error:", err);

        toast.error(
            err?.data?.message ||
            err?.message ||
            "Unable to process your order."
        );
    } finally {
        setLoading(false);
    }
};



  

  const handleMobankingConfirm = async () => {
    setShowBankingModal(false);
    await submitHandler("NBD");
  };

  const handleMobankingSelection = () => {
    setShowBankingModal(true);
  };

  const buttonStyles = {
    COD: { backgroundColor: "#8593ff", color: "#000000" },
    CASH: { backgroundColor: "#FFB84D", color: "#000000" },
    NBD: { backgroundColor: "#66bb66", color: "#000000" },
    ShopdmPay: { backgroundColor: "#28a745", color: "#ffffff" },
  };

  const baseStyle = {
    borderRadius: "50px",
    padding: "12px 25px",
    fontSize: "16px",
    fontWeight: "700",
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

      <div className="row wrapper" style={{ display: "flex", justifyContent: "center" }}>
        <div className="col-10 col-lg-5 shadow rounded p-4 mb-4" style={{ background: "linear-gradient(135deg, #f8fbf9 0%, #eef8f0 100%)", border: "1px solid #dcefe3" }}>
          <h4 className="text-center mb-4" style={{ color: "#1f6f42", fontWeight: 700 }}>Order Summary</h4>

          <div className="mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <strong>  <Price amount={itemsPrice}/></strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Shipping</span>
              <strong> <Price amount={shippingPrice}/> </strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Tax</span>
              <strong> <Price amount={taxPrice} /> </strong>
            </div>
            <hr />
            <div className="d-flex justify-content-between">
              <span>Total</span>
              <strong style={{ color: "#1f6f42", fontSize: "1.1rem" }}> <Price amount={totalPrice} /> </strong>
            </div>
          </div>

          <div className="rounded p-3" style={{ backgroundColor: "#ffffff", border: "1px solid #dcefe3" }}>
            <p className="mb-2"><strong>Delivery:</strong> {isShippingValid ? shippingOption : "Please select shipping option"}</p>
            <p className="mb-0"><strong>Customer:</strong> {user?.name || "Guest"}</p>
          </div>
        </div>

        <div className="col-10 col-lg-5">
          <div className="shadow rounded bg-body p-4" style={{ border: "1px solid #e7ecea" }}>
            <h2 className="mb-4 text-center" style={{ color: "#1f6f42", fontWeight: 700 }}>Select Payment Method</h2>

            <div className="d-flex flex-column align-items-center">
              <button
                onClick={() => submitHandler("CASH")}
                disabled={loading}
                style={{ ...baseStyle, ...buttonStyles.CASH }}
              >
                Cash Payment
              </button>

              <button
                onClick={handleMobankingSelection}
                disabled={loading}
                style={{ ...baseStyle, ...buttonStyles.NBD }}
              >
                Mobanking
              </button>

              <ShopdmPay amount={totalPrice} 
              onPay={() => submitHandler("ShopdmPay")} 
              disabled={loading || isShopdmLoading} 
              label="Shopdm Pay" />
            </div>

            {loading && <div className="text-center mt-3">Processing...</div>}
          </div>
        </div>
      </div>

      {showBankingModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
        >
          <div
            className="rounded shadow"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              background: "linear-gradient(135deg, #f7fff8 0%, #eaf8ee 45%, #dff5e4 100%)",
              border: "2px solid #2e8b57",
              boxShadow: "0 16px 40px rgba(46, 139, 87, 0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(46,139,87,0.18) 0 8px, transparent 9px), radial-gradient(circle at 80% 30%, rgba(46,139,87,0.12) 0 10px, transparent 11px), radial-gradient(circle at 40% 80%, rgba(46,139,87,0.15) 0 7px, transparent 8px)",
                backgroundSize: "24px 24px, 32px 32px, 28px 28px",
                opacity: 0.7,
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="text-center mb-3">
                <h4 className="mb-2" style={{ color: "#1f6f42", fontWeight: 700 }}>
                  Mobanking Payment Details
                </h4>
                <div
                  style={{
                    width: "72px",
                    height: "4px",
                    background: "linear-gradient(90deg, #2e8b57, #4caf50)",
                    borderRadius: "999px",
                    margin: "0 auto",
                  }}
                />
              </div>

              <p><strong>Account Name:</strong> Fidrick Benjamin</p>
              <p><strong>Account Number:</strong> 600400420</p>
              <p><strong>Mobile ID:</strong> 7672858487</p>
              <p><strong>Bank Name:</strong> National Bank of Dominica</p>
              <p><strong>Product:</strong> {cartItems?.[0]?.name || "Your order"}</p>
              <p><strong>Total:</strong> <Price amount={totalPrice} /> </p>

              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn flex-grow-1"
                  onClick={handleMobankingConfirm}
                  disabled={loading}
                  style={{
                    backgroundColor: "#2e8b57",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                  }}
                >
                  Mobanking Payment Sent
                </button>
                <button
                  className="btn btn-outline-secondary flex-grow-1"
                  onClick={() => setShowBankingModal(false)}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentMethod;