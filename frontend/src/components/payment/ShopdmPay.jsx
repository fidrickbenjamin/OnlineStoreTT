import React from "react";

const ShopdmPay = ({
  amount,
  invoiceId,
  reason,
  custom,
  orderId,
  onPay,
  disabled = false,
  label = "Shopdm Pay",
}) => {
  const handlePay = () => {
    if (typeof onPay === "function") {
      onPay({ amount, invoiceId, reason, custom, orderId });
      return;
    }

    window.alert(`Shopdm Pay requested for ${reason || "this order"}.`);
  };

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={disabled}
      className="btn btn-success mt-2"
      style={{
        width: "100%",
        maxWidth: "300px",
        borderRadius: "50px",
        padding: "12px 25px",
        fontSize: "16px",
        fontWeight: "700",
      }}
    >
      {label}
    </button>
  );
};

export default ShopdmPay;
