import React, { useState, useEffect } from "react";
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import CheckoutSteps from "./CheckoutSteps";
import { calculateOrderCost } from "../../helpers/helpers";
import {
    useCreateNewOrderMutation,
    useShopdmCheckoutMutation,
} from "../../redux/api/OrderApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ShopdmPay from "../payment/ShopdmPay";
import Price from "../Price/Price";

const PaymentMethod = () => {
    const [method, setMethod] = useState("");
    const [loading, setLoading] = useState(false);
    const [showBankingModal, setShowBankingModal] = useState(false);

    const navigate = useNavigate();

    // ==========================================
    // REDUX
    // ==========================================

    const {
        shippingInfo = {},
        cartItems = [],
        shippingOption,
    } = useSelector((state) => state.cart);

    const { user } = useSelector((state) => state.auth);

    // ==========================================
    // API MUTATIONS
    // ==========================================

    const [
        createNewOrder,
        {
            error: orderError,
        },
    ] = useCreateNewOrderMutation();

    const [
        shopdmCheckout,
        {
            isLoading: isShopdmLoading,
        },
    ] = useShopdmCheckoutMutation();

    // ==========================================
    // ORDER COST
    // ==========================================

    const {
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
    } = calculateOrderCost(
        cartItems,
        shippingOption
    );

    // ==========================================
    // VALID SHIPPING OPTIONS
    // ==========================================

    const validShippingOptions = [
        "roseau",
        "portsmouth",
        "pickup",
    ];

    const isShippingValid =
        validShippingOptions.includes(
            shippingOption
        );

    // ==========================================
    // ORDER ERROR
    // ==========================================

    useEffect(() => {
        if (orderError) {
            toast.error(
                orderError?.data?.message ||
                "Unable to create order."
            );
        }
    }, [orderError]);

    // ==========================================
    // BUILD ORDER DATA
    // ==========================================

    const buildOrderData = (
        selectedMethod,
        paymentInfo = {}
    ) => ({
        shippingInfo,

        shippingOption,

        orderItems: cartItems,

        itemsPrice,

        shippingAmount: shippingPrice,

        taxAmount: taxPrice,

        totalAmount: totalPrice,

        paymentInfo,

        paymentMethod: selectedMethod,

        // Shopdm orders remain pending until
        // payment is confirmed by the webhook.
        orderStatus:
            selectedMethod === "ShopdmPay"
                ? "Pending"
                : "Processing",
    });

    // ==========================================
    // MAIN PAYMENT HANDLER
    // ==========================================

    const submitHandler = async (
        selectedMethod
    ) => {
        setMethod(selectedMethod);

        // ------------------------------------------
        // CHECK CART
        // ------------------------------------------

        if (!cartItems.length) {
            toast.error("Cart is empty");
            return;
        }

        // ------------------------------------------
        // CHECK SHIPPING INFORMATION
        // ------------------------------------------

        if (
            !shippingInfo.address ||
            !shippingInfo.city ||
            !shippingInfo.zipCode ||
            !shippingInfo.phoneNo ||
            !shippingInfo.country
        ) {
            toast.error(
                "Please complete shipping information"
            );

            navigate("/shipping");

            return;
        }

        // ------------------------------------------
        // CHECK SHIPPING OPTION
        // ------------------------------------------

        if (!isShippingValid) {
            toast.error(
                "Please select a shipping option before continuing"
            );

            navigate("/shipping");

            return;
        }

        setLoading(true);

        try {
            // ==========================================
            // PAYMENT INFORMATION
            // ==========================================

            let paymentInfo = {
                status: "Not Paid",
            };

            if (selectedMethod === "NBD") {
                paymentInfo = {
                    status: "Verifying",
                };
            }

            if (selectedMethod === "ShopdmPay") {
                paymentInfo = {
                    status: "Pending",
                    provider: "ShopdmPay",
                };
            }

            // ==========================================
            // BUILD ORDER
            // ==========================================

            const orderData = buildOrderData(
                selectedMethod,
                paymentInfo
            );

            console.log(
                "Creating order:",
                orderData
            );

            // ==========================================
            // CREATE ORDER FIRST
            // ==========================================

            const result =
                await createNewOrder(
                    orderData
                ).unwrap();

            console.log(
                "Order creation response:",
                result
            );

            // ==========================================
            // VERIFY ORDER WAS CREATED
            // ==========================================

            if (
                !result?.success ||
                !result?.order?._id
            ) {
                throw new Error(
                    "Order was created but no order ID was returned."
                );
            }

            const orderId =
                result.order._id;

            console.log(
                "Created Order ID:",
                orderId
            );

            // ==========================================
            // SHOPDM PAY
            // ==========================================

            if (
                selectedMethod === "ShopdmPay"
            ) {
                // --------------------------------------
                // SAVE ORDER ID
                // --------------------------------------
                //
                // We need this when the customer
                // returns from Shopdm.
                //
                sessionStorage.setItem(
                    "shopdmPendingOrderId",
                    orderId
                );

                // --------------------------------------
                // GENERATE SHOPDM PAYMENT URL
                // --------------------------------------

                console.log(
                    "Generating Shopdm checkout..."
                );

                const payment =
                    await shopdmCheckout({
                        orderId,
                    }).unwrap();

                console.log(
                    "Shopdm checkout response:",
                    payment
                );

                // --------------------------------------
                // VERIFY CHECKOUT URL
                // --------------------------------------

                if (
                    !payment?.checkoutUrl
                ) {
                    throw new Error(
                        "Shopdm payment URL was not returned."
                    );
                }

                // --------------------------------------
                // DO NOT CLEAR CART HERE
                // --------------------------------------
                //
                // The order exists, but payment has
                // NOT been confirmed yet.
                //
                // The cart will be cleared only after
                // the Shopdm webhook confirms payment.
                //

                console.log(
                    "Redirecting to Shopdm..."
                );

                // --------------------------------------
                // REDIRECT CUSTOMER
                // --------------------------------------

                window.location.href =
                    payment.checkoutUrl;

                return;
            }

            // ==========================================
            // OTHER PAYMENT METHODS
            // ==========================================

            toast.success(
                "Order Completed!"
            );

            navigate(
                "/me/orders?order_success=true"
            );

        } catch (err) {
            console.error(
                "Payment processing error:",
                err
            );

            toast.error(
                err?.data?.message ||
                err?.message ||
                "Unable to process your order."
            );

        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // MOBANKING
    // ==========================================

    const handleMobankingConfirm =
        async () => {
            setShowBankingModal(false);

            await submitHandler("NBD");
        };

    const handleMobankingSelection =
        () => {
            setShowBankingModal(true);
        };

    // ==========================================
    // BUTTON STYLES
    // ==========================================

    const buttonStyles = {
        COD: {
            backgroundColor: "#8593ff",
            color: "#000000",
        },

        CASH: {
            backgroundColor: "#FFB84D",
            color: "#000000",
        },

        NBD: {
            backgroundColor: "#66bb66",
            color: "#000000",
        },

        ShopdmPay: {
            backgroundColor: "#28a745",
            color: "#ffffff",
        },
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

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <>
            <MetaData
                title={"Payment Method"}
            />

            <CheckoutSteps
                shipping
                ConfirmOrder
                Payment
            />

            <div
                className="row wrapper"
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                {/* =====================================
                    ORDER SUMMARY
                ====================================== */}

                <div
                    className="col-10 col-lg-5 shadow rounded p-4 mb-4"
                    style={{
                        background:
                            "linear-gradient(135deg, #f8fbf9 0%, #eef8f0 100%)",
                        border:
                            "1px solid #dcefe3",
                    }}
                >
                    <h4
                        className="text-center mb-4"
                        style={{
                            color: "#1f6f42",
                            fontWeight: 700,
                        }}
                    >
                        Order Summary
                    </h4>

                    <div className="mb-3">

                        <div className="d-flex justify-content-between mb-2">
                            <span>
                                Subtotal
                            </span>

                            <strong>
                                <Price
                                    amount={
                                        itemsPrice
                                    }
                                />
                            </strong>
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                            <span>
                                Shipping
                            </span>

                            <strong>
                                <Price
                                    amount={
                                        shippingPrice
                                    }
                                />
                            </strong>
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                            <span>
                                Tax
                            </span>

                            <strong>
                                <Price
                                    amount={
                                        taxPrice
                                    }
                                />
                            </strong>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between">

                            <span>
                                Total
                            </span>

                            <strong
                                style={{
                                    color: "#1f6f42",
                                    fontSize:
                                        "1.1rem",
                                }}
                            >
                                <Price
                                    amount={
                                        totalPrice
                                    }
                                />
                            </strong>

                        </div>

                    </div>

                    <div
                        className="rounded p-3"
                        style={{
                            backgroundColor:
                                "#ffffff",
                            border:
                                "1px solid #dcefe3",
                        }}
                    >

                        <p className="mb-2">
                            <strong>
                                Delivery:
                            </strong>{" "}
                            {isShippingValid
                                ? shippingOption
                                : "Please select shipping option"}
                        </p>

                        <p className="mb-0">
                            <strong>
                                Customer:
                            </strong>{" "}
                            {user?.name ||
                                "Guest"}
                        </p>

                    </div>
                </div>

                {/* =====================================
                    PAYMENT METHODS
                ====================================== */}

                <div className="col-10 col-lg-5">

                    <div
                        className="shadow rounded bg-body p-4"
                        style={{
                            border:
                                "1px solid #e7ecea",
                        }}
                    >

                        <h2
                            className="mb-4 text-center"
                            style={{
                                color: "#1f6f42",
                                fontWeight: 700,
                            }}
                        >
                            Select Payment Method
                        </h2>

                        <div className="d-flex flex-column align-items-center">

                            {/* CASH */}

                            <button
                                onClick={() =>
                                    submitHandler(
                                        "CASH"
                                    )
                                }
                                disabled={
                                    loading
                                }
                                style={{
                                    ...baseStyle,
                                    ...buttonStyles.CASH,
                                }}
                            >
                                Cash Payment
                            </button>

                            {/* MOBANKING */}

                            <button
                                onClick={
                                    handleMobankingSelection
                                }
                                disabled={
                                    loading
                                }
                                style={{
                                    ...baseStyle,
                                    ...buttonStyles.NBD,
                                }}
                            >
                                Mobanking
                            </button>

                            {/* SHOPDM PAY */}

                            <ShopdmPay
                                amount={
                                    totalPrice
                                }
                                onPay={() =>
                                    submitHandler(
                                        "ShopdmPay"
                                    )
                                }
                                disabled={
                                    loading ||
                                    isShopdmLoading
                                }
                                label="Shopdm Pay"
                            />

                        </div>

                        {/* LOADING */}

                        {(loading ||
                            isShopdmLoading) && (
                            <div className="text-center mt-3">
                                Processing...
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ==========================================
                MOBANKING MODAL
            =========================================== */}

            {showBankingModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor:
                            "rgba(0, 0, 0, 0.65)",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
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
                            background:
                                "linear-gradient(135deg, #f7fff8 0%, #eaf8ee 45%, #dff5e4 100%)",
                            border:
                                "2px solid #2e8b57",
                            boxShadow:
                                "0 16px 40px rgba(46, 139, 87, 0.2)",
                            position:
                                "relative",
                            overflow:
                                "hidden",
                        }}
                    >

                        <div
                            style={{
                                position:
                                    "absolute",
                                inset: 0,
                                backgroundImage:
                                    "radial-gradient(circle at 20% 20%, rgba(46,139,87,0.18) 0 8px, transparent 9px), radial-gradient(circle at 80% 30%, rgba(46,139,87,0.12) 0 10px, transparent 11px), radial-gradient(circle at 40% 80%, rgba(46,139,87,0.15) 0 7px, transparent 8px)",
                                backgroundSize:
                                    "24px 24px, 32px 32px, 28px 28px",
                                opacity: 0.7,
                                pointerEvents:
                                    "none",
                            }}
                        />

                        <div
                            style={{
                                position:
                                    "relative",
                                zIndex: 1,
                            }}
                        >

                            <div className="text-center mb-3">

                                <h4
                                    className="mb-2"
                                    style={{
                                        color:
                                            "#1f6f42",
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Mobanking Payment Details
                                </h4>

                                <div
                                    style={{
                                        width:
                                            "72px",
                                        height:
                                            "4px",
                                        background:
                                            "linear-gradient(90deg, #2e8b57, #4caf50)",
                                        borderRadius:
                                            "999px",
                                        margin:
                                            "0 auto",
                                    }}
                                />

                            </div>

                            <p>
                                <strong>
                                    Account Name:
                                </strong>{" "}
                                Fidrick Benjamin
                            </p>

                            <p>
                                <strong>
                                    Account Number:
                                </strong>{" "}
                                600400420
                            </p>

                            <p>
                                <strong>
                                    Mobile ID:
                                </strong>{" "}
                                7672858487
                            </p>

                            <p>
                                <strong>
                                    Bank Name:
                                </strong>{" "}
                                National Bank of Dominica
                            </p>

                            <p>
                                <strong>
                                    Product:
                                </strong>{" "}
                                {cartItems?.[0]
                                    ?.name ||
                                    "Your order"}
                            </p>

                            <p>
                                <strong>
                                    Total:
                                </strong>{" "}
                                <Price
                                    amount={
                                        totalPrice
                                    }
                                />
                            </p>

                            <div className="d-flex gap-2 mt-4">

                                <button
                                    className="btn flex-grow-1"
                                    onClick={
                                        handleMobankingConfirm
                                    }
                                    disabled={
                                        loading
                                    }
                                    style={{
                                        backgroundColor:
                                            "#2e8b57",
                                        color:
                                            "#fff",
                                        border:
                                            "none",
                                        fontWeight:
                                            600,
                                    }}
                                >
                                    Mobanking Payment Sent
                                </button>

                                <button
                                    className="btn btn-outline-secondary flex-grow-1"
                                    onClick={() =>
                                        setShowBankingModal(
                                            false
                                        )
                                    }
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