import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {

        // ✅ Set logged-in user
        setUser(state, action) {
            state.user = action.payload;
            state.isAuthenticated = true;
        },

        // ✅ Update authentication status
        setIsAuthenticated(state, action) {
            state.isAuthenticated = action.payload;
        },

        // ✅ Loading state
        setLoading(state, action) {
            state.loading = action.payload;
        },

        // ✅ Logout user
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            toast.info("Logged out successfully");
        },

        // ✅ Update shipping address locally (after API success)
        updateShippingInfo(state, action) {
            if (state.user) {
                state.user = {
                    ...state.user,
                    shippingInfo: action.payload,
                };
            }
        },

        // ✅ Set error
        setError(state, action) {
            state.error = action.payload;
            toast.error(action.payload);
        },

        // ✅ Clear error
        clearError(state) {
            state.error = null;
        },
    },
});

export const {
    setUser,
    setIsAuthenticated,
    setLoading,
    logout,
    updateShippingInfo,
    setError,
    clearError,
} = userSlice.actions;

export default userSlice.reducer;