
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v2" }),
    tagTypes: ["Order", "Orders", "AdminOrders"],

    endpoints: (builder) => ({

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

        getDashboardSales: builder.query({
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
            invalidatesTags: ["Order", "AdminOrders"],
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
    useCreateNewOrderMutation,
    useStripeCheckoutSessionMutation,
    useMyOrdersQuery,
    useOrderDetailsQuery,
    useLazyGetDashboardSalesQuery,
    useGetAdminOrdersQuery,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useCancelOrderMutation,
    useShopdmCheckoutMutation,
} = orderApi;

