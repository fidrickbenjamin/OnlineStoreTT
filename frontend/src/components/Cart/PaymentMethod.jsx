import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import CheckoutSteps from "./CheckoutSteps";
import { calculateOrderCost } from "../../helpers/helpers";
import { useCreateNewOrderMutation } from "../../redux/api/OrderApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ShopdmPay from "../payment/ShopdmPay";

const PaymentMethod = () => {
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { shippingInfo = {}, cartItems = [], shippingOption } =
    useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [createNewOrder, { error, isSuccess }] = useCreateNewOrderMutation();

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
    calculateOrderCost(cartItems, shippingOption);

  // ✅ VALID OPTIONS (must match backend schema)
  const validShippingOptions = ["roseau", "portsmouth", "pickup"];

  // ❌ DO NOT silently default — force user selection
  const isShippingValid =
    validShippingOptions.includes(shippingOption);

  useEffect(() => {
    if (error) toast.error(error?.data?.message);

    if (isSuccess) {
      navigate("/me/orders?order_success=true");
      toast.success("Order Completed!");
    }
  }, [error, isSuccess, navigate]);

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
            ? { status: "Pending", note: "Shopdm Pay pending confirmation" }
            : { status: "Not Paid" };

        const orderData = buildOrderData(selectedMethod, paymentInfo);
        await createNewOrder(orderData).unwrap();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShopdmPay = () => {
    submitHandler("ShopdmPay");
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
        <div className="col-10 col-lg-5 shadow rounded bg-light p-4 mb-4">
          <h4 className="text-center">Mobanking Information</h4>

          <p><strong>Account Name:</strong> Fidrick Benjamin</p>
          <p><strong>Account Number:</strong> 600400420</p>
          <p><strong>Mobile Id:</strong> 7672858487</p>
          <p><strong>Bank Name:</strong> National Bank of Dominica</p>

          <p>${totalPrice.toFixed(2)} USD</p>

          {/* ✅ FIXED DISPLAY */}
          <p>
            {shippingPrice.toFixed(2)} -{" "}
            {isShippingValid ? shippingOption : "Please select shipping option"}
          </p>

          <p>Order total: {(totalPrice * 2.67).toFixed(2)} XCD</p>
        </div>

        <div className="col-10 col-lg-5">
          <div className="shadow rounded bg-body p-4">
            <h2 className="mb-4 text-center">Select Payment Method</h2>

            <div className="d-flex flex-column align-items-center">
              {["CASH", "NBD"].map((m) => (
                <button
                  key={m}
                  onClick={() => submitHandler(m)}
                  disabled={loading}
                  style={{ ...baseStyle, ...buttonStyles[m] }}
                >
                  {m === "CASH" ? "Cash Payment" : "Mobanking"}
                </button>
              ))}

              <ShopdmPay
                amount={totalPrice}
                invoiceId={`order-${user?._id || Date.now()}`}
                reason={`Order ${user?._id || "checkout"}`}
                custom={user?._id}
                orderId={null}
                onPay={handleShopdmPay}
                disabled={loading}
                label="Shopdm Pay"
              />
            </div>

            {loading && <div className="text-center mt-3">Processing...</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;