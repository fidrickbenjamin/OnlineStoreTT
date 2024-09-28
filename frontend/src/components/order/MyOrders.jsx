import React, { useEffect } from "react";
import { useMyOrdersQuery } from "../../redux/api/OrderApi";
import Loader from "../layout/Loader";
import toast from "react-hot-toast";
import { MDBDataTable } from "mdbreact";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MetaData from "../layout/MetaData";
import { useDispatch } from "react-redux";
import { clearCart } from "../../redux/features/cartSlice";

const MyOrders = () => {
    const { data, isLoading, error } = useMyOrdersQuery();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const orderSuccess = searchParams.get("order_success");

    useEffect(() => {    
        if (error) {
            toast.error(error?.data?.message);
        }
        if (orderSuccess) {
            dispatch(clearCart());
            navigate("/me/orders");
        }
    }, [error, orderSuccess]);

    const cancelOrderHandler = async (orderId) => {
        try {
            const response = await fetch(`/api/orders/cancel-order/${orderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
                navigate("/me/orders");
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error('Error canceling the order');
        }
    };

    const setOrders = () => {
        const orders = {
            columns: [
                { label: "ID", field: "id", sort: "asc" },
                { label: "Amount Paid", field: "amount", sort: "asc" },
                { label: "Payment Status", field: "paymentStatus", sort: "asc" },
                { label: "Order Status", field: "orderStatus", sort: "asc" },
                { label: "Actions", field: "actions", sort: "asc" },
            ],
            rows: [],
        };

        data?.orders?.forEach((order) => {
            orders.rows.push({
                id: order?._id,
                amount: `$${order?.totalAmount}`,
                paymentStatus: order?.paymentInfo?.status?.toUpperCase(),
                orderStatus: order?.orderStatus,
                actions: (
                    <>
                        <Link to={`/me/order/${order?._id}`} className="btn btn-primary">
                        <i class="bi bi-eye"></i>
                        </Link>
                        <Link to={`/invoice/order/${order?._id}`} className="btn btn-success ms-2">
                        <i class="bi bi-printer"></i>
                        </Link>
                        <button
                            className="btn btn-danger ms-2"
                            onClick={() => cancelOrderHandler(order?._id)}
                            disabled={order?.orderStatus === 'Delivered'}
                        >
                            <i class="bi bi-x-lg"></i> Cancel Order
                        </button>
                    </>
                ),
            });
        });

        return orders;
    };

    if (isLoading) return <Loader />;

    return (
        <div>
            <MetaData title={"My Orders"} />
            <h1 className="my-5">{data?.orders?.length} Orders</h1>

            <MDBDataTable 
                data={setOrders()}
                className="px-3"
                bordered
                striped
                hover
            />
        </div>
    );
};

export default MyOrders;
