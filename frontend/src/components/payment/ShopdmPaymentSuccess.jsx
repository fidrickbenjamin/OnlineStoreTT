import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useDispatch,
} from "react-redux";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    toast,
} from "react-hot-toast";

import {
    clearCart,
} from "../../redux/features/cartSlice";

import {
    useOrderDetailsQuery,
} from "../../redux/api/OrderApi";

const ShopdmPaymentSuccess = () => {
    const { orderId: routeOrderId } =
    useParams();

const orderId =
    routeOrderId ||
    sessionStorage.getItem(
        "shopdmPendingOrderId"
    );

    const dispatch =
        useDispatch();

    const navigate =
        useNavigate();

    const [
        confirmed,
        setConfirmed,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] = useState(
        "Confirming your payment..."
    );

    const attempts =
        useRef(0);

    const MAX_ATTEMPTS = 15;

    const {
        data,
        refetch,
    } = useOrderDetailsQuery(
        orderId,
        {
            skip: !orderId,
            refetchOnMountOrArgChange: true,
        }
    );

    // ==========================================
    // CHECK PAYMENT STATUS
    // ==========================================

    useEffect(() => {
        if (
            !orderId ||
            confirmed ||
            !data?.order
        ) {
            return;
        }

        const paymentStatus =
            data?.order
                ?.paymentInfo
                ?.status
                ?.toLowerCase();

        console.log(
            "Shopdm payment status:",
            paymentStatus
        );

        // ======================================
        // PAYMENT SUCCESSFUL
        // ======================================

        if (
            paymentStatus?.toLowerCase() === "paid"
        ) {
            console.log(
                "Shopdm payment confirmed."
            );

            dispatch(
                clearCart()
            );

            sessionStorage.removeItem(
                "shopdmPendingOrderId"
            );

            setConfirmed(true);

            setMessage(
                "Payment successful! Your order has been confirmed."
            );

            toast.success(
                "Payment successful! Your order has been confirmed."
            );

            const timer =
                setTimeout(() => {
                    navigate(
                        "/me/orders?order_success=true",
                        {
                            replace: true,
                        }
                    );
                }, 1500);

            return () =>
                clearTimeout(timer);
        }

        // ======================================
        // FAILED / CANCELLED
        // ======================================

        if (
            paymentStatus ===
                "failed" ||
            paymentStatus ===
                "cancelled" ||
            paymentStatus ===
                "canceled"
        ) {
            sessionStorage.removeItem(
                "shopdmPendingOrderId"
            );

            setConfirmed(true);

            setMessage(
                "Payment was not completed."
            );

            toast.error(
                "Shopdm payment was not completed."
            );

            const timer =
                setTimeout(() => {
                    navigate(
                        "/payment",
                        {
                            replace: true,
                        }
                    );
                }, 1500);

            return () =>
                clearTimeout(timer);
        }

        setMessage(
            "Confirming your Shopdm payment..."
        );

    }, [
        data,
        orderId,
        confirmed,
        dispatch,
        navigate,
    ]);

    // ==========================================
    // POLL BACKEND
    // ==========================================

    useEffect(() => {
        if (
            !orderId ||
            confirmed
        ) {
            return;
        }

        const interval =
            setInterval(
                async () => {
                    attempts.current += 1;

                    console.log(
                        `Checking Shopdm payment ${attempts.current}/${MAX_ATTEMPTS}`
                    );

                    try {
                        await refetch();
                    } catch (error) {
                        console.error(
                            "Unable to check payment:",
                            error
                        );
                    }

                    if (
                        attempts.current >=
                        MAX_ATTEMPTS
                    ) {
                        clearInterval(
                            interval
                        );

                        setMessage(
                            "Payment confirmation is taking longer than expected."
                        );
                    }

                },
                2000
            );

        return () => {
            clearInterval(
                interval
            );
        };

    }, [
        orderId,
        confirmed,
        refetch,
    ]);

    // ==========================================
    // NO ORDER ID
    // ==========================================

    if (!orderId) {
        return (
            <div
                className="container text-center"
                style={{
                    paddingTop:
                        "100px",
                }}
            >
                <h2>
                    Unable to verify payment
                </h2>

                <p>
                    No order ID was provided.
                </p>

                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    Return to Store
                </button>
            </div>
        );
    }

    return (
        <div
            className="container text-center"
            style={{
                paddingTop:
                    "100px",
            }}
        >
            {!confirmed ? (
                <>
                    <div
                        className="spinner-border mb-4"
                        role="status"
                    />

                    <h2>
                        {message}
                    </h2>

                    <p className="text-muted">
                        Please wait while we
                        confirm your Shopdm
                        payment.
                    </p>

                    <p className="text-muted">
                        Order ID: {orderId}
                    </p>
                </>
            ) : (
                <>
                    <h2>
                        {message}
                    </h2>

                    <p>
                        Redirecting you back
                        to the store...
                    </p>
                </>
            )}
        </div>
    );
};

export default ShopdmPaymentSuccess;