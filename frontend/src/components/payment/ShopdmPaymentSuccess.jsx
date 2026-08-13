import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";  
import { toast } from "react-hot-toast";

import { clearCart } from "../../redux/features/cartSlice";
import { useOrderDetailsQuery } from "../../redux/api/OrderApi";

const ShopdmPaymentSuccess = () => {

    const { orderId } = useParams();

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const [confirmed, setConfirmed] =
        useState(false);

    const {
        data,
        isLoading,
        refetch,
    } = useOrderDetailsQuery(orderId, {
        skip: !orderId,
    });

    useEffect(() => {

        if (!orderId || confirmed) {
            return;
        }

        const paymentStatus =
            data?.order?.paymentInfo?.status;

        console.log(
            "Shopdm payment status:",
            paymentStatus
        );

        if (paymentStatus === "Paid") {

            console.log(
                "Payment confirmed."
            );

            console.log(
                "Clearing cart..."
            );

            dispatch(clearCart());

            setConfirmed(true);

            toast.success(
                "Payment successful! Your order has been confirmed."
            );

            setTimeout(() => {

                navigate(
                    "/me/orders?order_success=true"
                );

            }, 1000);
        }

    }, [
        data,
        orderId,
        confirmed,
        dispatch,
        navigate,
    ]);

    // Poll every 2 seconds while waiting
    useEffect(() => {

        if (!orderId || confirmed) {
            return;
        }

        const interval = setInterval(() => {

            console.log(
                "Checking order payment..."
            );

            refetch();

        }, 2000);

        return () => {
            clearInterval(interval);
        };

    }, [
        orderId,
        confirmed,
        refetch,
    ]);

    return (
        <div
            className="container text-center"
            style={{
                paddingTop: "100px",
            }}
        >

            {!confirmed ? (
                <>
                    <div
                        className="spinner-border mb-4"
                        role="status"
                    />

                    <h2>
                        Confirming your payment...
                    </h2>

                    <p className="text-muted">
                        Please wait while we confirm
                        your Shopdm payment.
                    </p>

                    <p className="text-muted">
                        Order ID: {orderId}
                    </p>
                </>
            ) : (
                <>
                    <h2>
                        Payment Successful!
                    </h2>

                    <p>
                        Your order has been confirmed.
                    </p>
                </>
            )}

        </div>
    );
};

export default ShopdmPaymentSuccess;