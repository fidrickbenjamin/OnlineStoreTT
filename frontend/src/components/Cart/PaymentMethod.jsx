import React, { useState, useEffect, useRef, useCallback } from "react";
import MetaData from "../layout/MetaData";
import { useDispatch, useSelector } from "react-redux";
import CheckoutSteps from "./CheckoutSteps";
import { calculateOrderCost } from "../../helpers/helpers";
import {
    useCreateNewOrderMutation,
    useShopdmCheckoutMutation,
} from "../../redux/api/OrderApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Price from "../Price/Price";

// IMPORTANT:
// Change this import path if your cartSlice is located somewhere else.
import { clearCart } from "../../redux/features/cartSlice";
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useCreatePayPalOrderMutation, useCapturePayPalOrderMutation } from "../../redux/api/OrderApi";

const PaymentMethod = () => {
    const paypalClientId = (process.env.REACT_APP_PAYPAL_CLIENT_ID || "").trim();
    const [retry, setRetry] = useState({ key: 0, automatic: 0 });
    const onPayPalRetry = useCallback(() => {
        setRetry((previous) => ({ key: previous.key + 1, automatic: 0 }));
    }, []);
    const onAutoRetry = useCallback(() => {
        setRetry((previous) => previous.automatic >= 2 ? previous : ({ key: previous.key + 1, automatic: previous.automatic + 1 }));
    }, []);
    return <PaymentMethodShell key={retry.key} paypalClientId={paypalClientId} onPayPalRetry={onPayPalRetry} onAutoRetry={onAutoRetry} automaticRetries={retry.automatic} />;
};

const PaymentMethodShell = ({ paypalClientId, ...retryProps }) => {
    if (!paypalClientId) return <PaymentMethodContent paypalClientId="" />;
    return (
        <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: process.env.REACT_APP_PAYPAL_CURRENCY || "USD", intent: "capture", components: "buttons" }}>
            <PayPalReadyContent paypalClientId={paypalClientId} {...retryProps} />
        </PayPalScriptProvider>
    );
};

const PayPalReadyContent = (props) => {
    const [{ isResolved, isRejected }] = usePayPalScriptReducer();
    const [scriptSlow, setScriptSlow] = useState(false);
    useEffect(() => {
        if (isResolved || isRejected) return;
        const timer = setTimeout(() => setScriptSlow(true), 15000);
        return () => clearTimeout(timer);
    }, [isResolved, isRejected]);
    return <PaymentMethodContent {...props} paypalReady={isResolved} paypalFailed={isRejected} paypalSlow={scriptSlow && !isResolved} />;
};

// Script loading and button rendering are separate steps. Keep a visible status
// until the SDK initializes the real button; never leave an empty payment panel.
const DirectPayPalButtons = ({ busy, createOrder, onApprove, onCancel, onRetry, onAutoRetry, automaticRetries }) => {
    const checkoutStarted = useRef(false);
    const [initialized, setInitialized] = useState(false);
    const [buttonError, setButtonError] = useState("");
    const [renderSlow, setRenderSlow] = useState(false);
    useEffect(() => {
        if (initialized || buttonError) return;
        const timer = setTimeout(() => setRenderSlow(true), 15000);
        return () => clearTimeout(timer);
    }, [initialized, buttonError]);
    useEffect(() => {
        // Only retry loading. Never remount the SDK after checkout has started.
        if (initialized || busy || checkoutStarted.current || (!renderSlow && !buttonError) || automaticRetries >= 2) return;
        const timer = setTimeout(onAutoRetry, 2000);
        return () => clearTimeout(timer);
    }, [initialized, busy, renderSlow, buttonError, automaticRetries, onAutoRetry]);
    return (
        <div className="tt-paypal-buttons">
            {!initialized && !buttonError && !renderSlow && <p role="status" className="tt-sdk-status">Preparing secure PayPal button…</p>}
            <PayPalButtons
                fundingSource="paypal"
                style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 48, tagline: false }}
                disabled={busy}
                createOrder={(...args) => {
                    checkoutStarted.current = true;
                    return createOrder(...args);
                }}
                onApprove={onApprove}
                onCancel={onCancel}
                onInit={() => { setInitialized(true); setRenderSlow(false); setButtonError(""); }}
                onError={(error) => {
                    console.error("PayPal button/checkout error:", error);
                    setButtonError("PayPal could not complete loading or checkout. Please check My Orders before trying again.");
                    toast.error(error?.data?.message || error?.message || "PayPal checkout could not be completed.");
                }}
            >
                <p className="tt-sdk-status" role="status">PayPal is not available for this checkout. Please choose another payment method.</p>
            </PayPalButtons>
            {(buttonError || (renderSlow && !initialized)) && (
                <div className="tt-paypal-alert" role="alert">
                    <p>{buttonError || "PayPal’s button is taking longer than expected. Check your connection and whether your browser or an extension is blocking PayPal."}</p>
                    {!checkoutStarted.current && automaticRetries < 2 && <p role="status">Retrying automatically in a moment… ({automaticRetries + 1}/2)</p>}
                    <button type="button" onClick={onRetry} disabled={busy} className="tt-paypal-retry">Retry PayPal</button>
                </div>
            )}
        </div>
    );
};

const PaymentIcon = ({ kind }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {kind === "bank" ? <><path d="M3 9l9-6 9 6H3zM3 21h18M5 11v7m7-7v7m7-7v7" /></> : kind === "cash" ? <><rect x="2" y="5" width="20" height="14" rx="3" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" /></> : <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 9h18m-13 6h3m4 0h1" /></>}
    </svg>
);

const PaymentMethodContent = ({ paypalClientId, paypalReady = false, paypalFailed = false, paypalSlow = false, onPayPalRetry, onAutoRetry, automaticRetries = 0 }) => {
    const [loading, setLoading] = useState(false);
    const [showBankingModal, setShowBankingModal] = useState(false);
    const paypalCheckout = useRef(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // ==========================================
    // REDUX
    // ==========================================

    const {
        shippingInfo = {},
        cartItems = [],
        shippingOption,
        checkoutQuote,
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
    const [createPayPalOrder] = useCreatePayPalOrderMutation();
    const [capturePayPalOrder] = useCapturePayPalOrderMutation();

    useEffect(() => {
        if (paypalReady || (!paypalFailed && !paypalSlow) || loading || isShopdmLoading || paypalCheckout.current || automaticRetries >= 2) return;
        const timer = setTimeout(onAutoRetry, 2000);
        return () => clearTimeout(timer);
    }, [paypalReady, paypalFailed, paypalSlow, loading, isShopdmLoading, automaticRetries, onAutoRetry]);


    // ==========================================
    // ORDER COST
    // ==========================================

    const {
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
    } = checkoutQuote ? {itemsPrice:checkoutQuote.itemsPrice,shippingPrice:checkoutQuote.shippingAmount,taxPrice:checkoutQuote.taxAmount,totalPrice:checkoutQuote.totalAmount} : calculateOrderCost(cartItems,shippingOption);

    // ==========================================
    // VALID SHIPPING OPTIONS
    // ==========================================

    const isShippingValid = Boolean(checkoutQuote?.quoteHash && shippingOption && shippingOption!=="none");

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

        shippingAmount:
            shippingPrice,

        taxAmount:
            taxPrice,

        totalAmount:
            totalPrice,

        paymentInfo,

        paymentMethod:
            selectedMethod,

        // Shopdm orders remain Pending
        // until payment is confirmed.
        orderStatus:
            selectedMethod === "ShopdmPay" || selectedMethod === "PayPal"
                ? "Pending"
                : "Processing",
    });

    // ==========================================
    // MAIN PAYMENT HANDLER
    // ==========================================

    const submitHandler = async (
        selectedMethod
    ) => {

        // ------------------------------------------
        // CHECK CART
        // ------------------------------------------

        if (!cartItems.length) {
            toast.error("Cart is empty");
            if (selectedMethod === "PayPal") throw new Error("Cart is empty");
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

            if (selectedMethod === "PayPal") throw new Error("Please complete your shipping details and select delivery.");
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

            if (selectedMethod === "PayPal") throw new Error("Please complete your shipping details and select delivery.");
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

            if (
                selectedMethod === "NBD"
            ) {
                paymentInfo = {
                    status: "Verifying",
                };
            }

            if (
                selectedMethod === "ShopdmPay"
            ) {
                paymentInfo = {
                    status: "Pending",
                    provider: "ShopdmPay",
                };
            }

            if (selectedMethod === "PayPal") paymentInfo = { status: "Pending", provider: "PayPal" };

            // ==========================================
            // BUILD ORDER
            // ==========================================

            const orderData =
                buildOrderData(
                    selectedMethod,
                    paymentInfo
                );

            console.log(
                "Creating order:",
                orderData
            );

            // ==========================================
            // CREATE ORDER
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
            // VERIFY ORDER
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
                // SAVE PENDING ORDER ID
                // --------------------------------------

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
                // IMPORTANT
                //
                // DO NOT CLEAR CART HERE.
                //
                // Payment has not been confirmed.
                // --------------------------------------

                console.log(
                    "Redirecting to Shopdm..."
                );

                window.location.href =
                    payment.checkoutUrl;

                return;
            }

            if (selectedMethod === "PayPal") {
                const paypal = await createPayPalOrder({ orderId }).unwrap();
                if (!paypal?.id) throw new Error("PayPal did not return an order reference.");
                sessionStorage.setItem("paypalPendingOrderId", orderId);
                paypalCheckout.current = { orderId, paypalOrderId: paypal.id };
                return paypal.id;
            }

            // ==========================================
            // OTHER PAYMENT METHODS
            // ==========================================

            dispatch(clearCart());
            toast.success("Order received. View your payment and delivery details below.");
            navigate(`/me/order/${orderId}?created=true`);

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
            if (selectedMethod === "PayPal") throw err;
        } finally {
            setLoading(false);
        }
    };

    const onPayPalApprove = async (data) => {
        setLoading(true);
        try {
            if (!paypalCheckout.current || data.orderID !== paypalCheckout.current.paypalOrderId) throw new Error("PayPal order reference does not match checkout.");
            const orderId = paypalCheckout.current?.orderId;
            if (!orderId) throw new Error("Your pending order could not be found. Please check My Orders before retrying.");
            await capturePayPalOrder({ orderId, paypalOrderId: data.orderID }).unwrap();
            sessionStorage.removeItem("paypalPendingOrderId");
            dispatch(clearCart());
            toast.success("PayPal payment completed.");
            navigate(`/me/order/${orderId}`);
        } catch (err) {
            toast.error(err?.data?.message || err?.message || "PayPal could not confirm payment.");
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

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <>
            <style>{`
                .tt-payment-layout { align-items: flex-start; row-gap: 24px; padding: 24px 0 40px; }
                .tt-payment-options { display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: 440px; margin: 0 auto; }
                .tt-paypal-panel { padding: 22px; border: 1px solid #d9e5f4; border-radius: 16px; background: linear-gradient(145deg, #fff, #f1f6fd); box-shadow: 0 5px 18px rgba(0,48,135,.05); }
                .tt-paypal-title { font-size: 19px; font-weight: 750; color: #003087; margin: 0 0 7px; }
                .tt-payment-note { font-size: 14px; line-height: 1.5; color: #536477; margin: 0 0 18px; }
                .tt-paypal-buttons { position: relative; width: 100%; min-width: 0; min-height: 48px; }
                .tt-paypal-buttons > div { width: 100%; }
                .tt-sdk-status { font-size: 13px; color: #536477; line-height: 1.5; margin: 10px 0; }
                .tt-paypal-alert { padding: 12px; border: 1px solid #e7cf8b; border-radius: 9px; background: #fff9e9; color: #634d19; font-size: 13px; line-height: 1.5; }
                .tt-paypal-alert p { margin: 0 0 10px; }
                .tt-paypal-retry { border: 1px solid #003087; background: white; color: #003087; font-weight: 700; padding: 8px 14px; border-radius: 7px; }
                .tt-other-payments { display: flex; flex-direction: column; gap: 16px; }
                .tt-payment-divider { display: flex; align-items: center; gap: 12px; color: #64748b; font-size: 12px; letter-spacing: .04em; margin: 2px 0; }
                .tt-payment-divider::before, .tt-payment-divider::after { content: ""; height: 1px; background: #e2e8f0; flex: 1; }
                .tt-payment-card { width: 100%; min-height: 88px; display: flex; align-items: center; gap: 14px; padding: 18px; border: 1px solid; border-radius: 14px; text-align: left; cursor: pointer; position: relative; overflow: hidden; transition: transform .18s ease, box-shadow .18s ease; }
                .tt-payment-card:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 9px 20px rgba(15,45,32,.13); }
                .tt-payment-card .tt-method-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 12px; }
                .tt-method-copy { display: flex; flex-direction: column; gap: 5px; min-width: 0; flex: 1; }
                .tt-method-name { font-size: 17px; font-weight: 750; line-height: 1.2; }
                .tt-method-detail { font-size: 12px; font-weight: 400; line-height: 1.5; }
                .tt-method-arrow { font-size: 24px; font-weight: 400; flex-shrink: 0; }
                .tt-cash-card { background: linear-gradient(120deg, #fff8e9, #ffe3ad); border-color: #edcf96; color: #64420c; box-shadow: 0 3px 9px rgba(135,93,15,.06); }
                .tt-cash-card .tt-method-icon { background: #fffaf0; border: 1px solid #ebd7ad; color: #9b6a12; }
                .tt-nbd-card { background: linear-gradient(115deg, #06482e, #087b49); border-color: #09673f; color: white; box-shadow: 0 4px 12px rgba(4,82,47,.15); }
                .tt-nbd-card::after { content: ""; width: 120px; height: 120px; border: 18px solid rgba(255,255,255,.045); border-radius: 50%; position: absolute; right: -40px; top: -50px; pointer-events: none; }
                .tt-nbd-card .tt-method-icon { background: rgba(255,255,255,.13); border: 1px solid rgba(255,255,255,.27); }
                .tt-nbd-card .tt-method-detail { color: #e0f4e6; }
                .tt-method-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 4px; vertical-align: middle; margin-left: 7px; background: rgba(255,255,255,.17); letter-spacing: .06em; }
                .tt-shopdm-card { background: linear-gradient(115deg, #fcfdfd 0%, #dce4e3 58%, #f7f9f9 100%); border-color: #c3d0cb; color: #145639; box-shadow: 0 3px 10px rgba(35,62,49,.08); }
                .tt-shopdm-card::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: linear-gradient(#39b66e,#087244); }
                .tt-shopdm-card .tt-method-icon { color: white; background: linear-gradient(145deg,#2ba968,#087244); box-shadow: 0 3px 7px rgba(8,114,68,.2); }
                .tt-shopdm-card .tt-method-detail { color: #52675d; }
                .tt-payment-options button:disabled { cursor: not-allowed; opacity: .6; }
                .tt-payment-options button:focus-visible { outline: 3px solid #0070ba; outline-offset: 3px; }
                @media (prefers-reduced-motion: reduce) { .tt-payment-card { transition: none; } .tt-payment-card:not(:disabled):hover { transform: none; } }
                @media (max-width: 575px) { .tt-paypal-panel { padding: 18px 14px; } .tt-payment-card { padding: 16px 14px; gap: 11px; } .tt-method-name { font-size: 16px; } }
            `}</style>
            <MetaData
                title="Payment Method"
            />

            <CheckoutSteps
                shipping
                ConfirmOrder
                Payment
            />

            <div
                className="row wrapper tt-payment-layout"
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

                        <p className="text-center tt-payment-note">Choose how you would like to pay for your order.</p>
                        <div className="tt-payment-options">
                            <section className="tt-paypal-panel" aria-labelledby="tt-paypal-title">
                                <h3 id="tt-paypal-title" className="tt-paypal-title">PayPal</h3>
                                <p className="tt-payment-note">Pay securely with the options available through PayPal.</p>
                                {!paypalClientId ? (
                                    <p role="status" className="mb-0 tt-payment-note">PayPal is currently unavailable. Please choose another payment method.</p>
                                ) : paypalFailed || paypalSlow ? (
                                    <div className="tt-paypal-alert" role="alert">
                                        <p>PayPal could not load. Check your connection and whether your browser or an extension is blocking PayPal, or choose another payment method.</p>
                                        {automaticRetries < 2 && <p role="status">Retrying automatically in a moment… ({automaticRetries + 1}/2)</p>}
                                        <button type="button" className="tt-paypal-retry" onClick={onPayPalRetry}>Retry PayPal</button>
                                    </div>
                                ) : !paypalReady ? (
                                    <p role="status" className="mb-0 tt-sdk-status">Loading secure PayPal checkout…</p>
                                ) : (
                                    <DirectPayPalButtons
                                        busy={loading || isShopdmLoading || !cartItems.length}
                                        createOrder={() => submitHandler("PayPal")}
                                        onApprove={onPayPalApprove}
                                        onCancel={() => toast("PayPal checkout cancelled. Your pending order remains in My Orders.")}
                                        onRetry={onPayPalRetry}
                                        onAutoRetry={onAutoRetry}
                                        automaticRetries={automaticRetries}
                                    />
                                )}
                            </section>

                            <div className="tt-payment-divider">Other payment methods</div>
                            <div className="tt-other-payments">
                                <button type="button" className="tt-payment-card tt-cash-card" onClick={() => submitHandler("CASH")} disabled={loading || isShopdmLoading}>
                                    <span className="tt-method-icon"><PaymentIcon kind="cash" /></span>
                                    <span className="tt-method-copy"><span className="tt-method-name">Cash Payment</span><span className="tt-method-detail">Complete your order and arrange payment</span></span>
                                    <span className="tt-method-arrow" aria-hidden="true">›</span>
                                </button>
                                <button type="button" className="tt-payment-card tt-nbd-card" onClick={handleMobankingSelection} disabled={loading || isShopdmLoading}>
                                    <span className="tt-method-icon"><PaymentIcon kind="bank" /></span>
                                    <span className="tt-method-copy"><span className="tt-method-name">Mobanking <span className="tt-method-badge">NBD</span></span><span className="tt-method-detail">National Bank of Dominica · Bank transfer</span></span>
                                    <span className="tt-method-arrow" aria-hidden="true">›</span>
                                </button>
                                <button type="button" className="tt-payment-card tt-shopdm-card" onClick={() => submitHandler("ShopdmPay")} disabled={loading || isShopdmLoading}>
                                    <span className="tt-method-icon"><PaymentIcon kind="card" /></span>
                                    <span className="tt-method-copy"><span className="tt-method-name">ShopDM Pay</span><span className="tt-method-detail">Continue to ShopDM to complete payment</span></span>
                                    <span className="tt-method-arrow" aria-hidden="true">›</span>
                                </button>
                            </div>
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
