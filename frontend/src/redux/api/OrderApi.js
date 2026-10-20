
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v2", credentials: "include" }),
    tagTypes: ["Order", "Orders", "AdminOrders", "Sales"],

    endpoints: (builder) => ({

        deliveryOptions: builder.query({ query: () => "/delivery/options" }),
        uploadPaymentProof: builder.mutation({
            query: ({id, ...body}) => ({ url: `/orders/${id}/payment-proof`, method: "POST", body }),
            invalidatesTags: ["Order", "Orders", "AdminOrders"],
        }),
        reviewPaymentProof: builder.mutation({
            query: ({id, ...body}) => ({ url: `/admin/orders/${id}/payment-proof/review`, method: "POST", body }),
            invalidatesTags: ["Order", "Orders", "AdminOrders", "Sales"],
        }),
        createNewOrder: builder.mutation({
            query(body) {
                return {
                    url: "/orders/new",
                    method: "POST",
                    body,
                };
            },
        }),

        myOrders: builder.query({
            query: () => `/me/orders`,
            providesTags: ["Order", "Orders"],
        }),

        orderDetails: builder.query({
            query: (id) => `/orders/${id}`,
            providesTags: ["Order"],
        }),

        cancelOrder: builder.mutation({
            query: (id) => ({
                url: `/orders/cancel-order/${id}`,
                method: "POST",
            }),
            invalidatesTags: ["Order", "Orders", "AdminOrders"],
        }),

        stripeCheckoutSession: builder.mutation({
            query(body) {
                return {
                    url: "/payment/checkout_session",
                    method: "POST",
                    body,
                };
            },
        }),

        // Shopdm Pay checkout
        shopdmCheckout: builder.mutation({
            query: ({ orderId }) => ({
                url: "/payment/shopdm-checkout",
                method: "POST",
                body: { orderId },
            }),
        }),

        createPayPalOrder: builder.mutation({
            query: ({ orderId }) => ({ url: "/payment/paypal/create-order", method: "POST", body: { orderId } }),
        }),

        capturePayPalOrder: builder.mutation({
            query: ({ orderId, paypalOrderId }) => ({ url: `/payment/paypal/capture/${orderId}`, method: "POST", body: { paypalOrderId } }),
            invalidatesTags: ["Order", "Orders", "AdminOrders", "Sales"],
        }),

        getDashboardSales: builder.query({
            providesTags: ["Sales"],
            query: ({ startDate, endDate }) =>
                `/admin/get_sales/?startDate=${startDate}&endDate=${endDate}`,
        }),

        getAdminOrders: builder.query({
            query: () => `/admin/orders`,
            providesTags: ["AdminOrders"],
        }),

        updateOrder: builder.mutation({
            query({ id, body }) {
                return {
                    url: `/admin/orders/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["Order", "Orders", "AdminOrders", "Sales"],
        }),

        deleteOrder: builder.mutation({
            query(id) {
                return {
                    url: `/admin/orders/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["AdminOrders"],
        }),

    }),
});

export const {
    useDeliveryOptionsQuery,
    useUploadPaymentProofMutation,
    useReviewPaymentProofMutation,
    useCreateNewOrderMutation,
    useStripeCheckoutSessionMutation,
    useMyOrdersQuery,
    useOrderDetailsQuery,
    useLazyGetDashboardSalesQuery,
    useGetDashboardSalesQuery,
    useGetAdminOrdersQuery,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useCancelOrderMutation,
    useShopdmCheckoutMutation,
    useCreatePayPalOrderMutation,
    useCapturePayPalOrderMutation,
} = orderApi;

