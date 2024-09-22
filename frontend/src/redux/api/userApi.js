import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setIsAuthenticated, setLoading, setUser } from "../features/userSlice";

// Define the userApi
export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v2" }),
    tagTypes: ["User", "AdminUsers", "AdminUser"],
    endpoints: (builder) => ({
        getMe: builder.query({
            query: () => '/me',
            transformResponse: (result) => result.user,
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data));
                    dispatch(setIsAuthenticated(true));
                    dispatch(setLoading(false));
                } catch (error) {
                    dispatch(setLoading(false));
                    console.log(error);
                }
            },
            providesTags: ["User"],
        }),

        updateProfile: builder.mutation({
            query(body) {
                return {
                    url: "/me/update",
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["User"],
        }),

        uploadAvatar: builder.mutation({
            query(body) {
                return {
                    url: "/me/upload_avatar",
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["User"],
        }),

        updatePassword: builder.mutation({
            query(body) {
                return {
                    url: "/password/update",
                    method: "PUT",
                    body,
                };
            },
        }),

        forgotPassword: builder.mutation({
            query(body) {
                return {
                    url: "/password/forgot",
                    method: "POST",
                    body,
                };
            },
        }),

        resetPassword: builder.mutation({
            query: (token, body) => ({
                url: `/password/reset/${token}`,
                method: "PUT",
                body,
            }),
        }),

        getAdminUsers: builder.query({
            query: () => '/admin/users',
            providesTags: ["AdminUsers"],
        }),

        getUserDetails: builder.query({
            query: (id) => `/admin/users/${id}`,
            providesTags: ["AdminUser"],
        }),

        updateUser: builder.mutation({
            query: ({ id, body }) => ({
                url: `/admin/users/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["User", "AdminUser", "AdminUsers"],
        }),

        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User", "AdminUser", "AdminUsers"],
        }),

        // New updateAddress mutation
        updateAddress: builder.mutation({
            query: (shippingInfo) => ({
                url: `/me/profile`,
                method: "PUT",
                body: shippingInfo,
            }),
            invalidatesTags: ["User"], // Ensures cache is refreshed after the mutation
        }),
    }),
});

// Export hooks for usage in functional components
export const { 
    useGetMeQuery,
    useUpdateProfileMutation,
    useUploadAvatarMutation,
    useUpdatePasswordMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGetAdminUsersQuery,
    useGetUserDetailsQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useUpdateAddressMutation // Export the new hook
} = userApi;
