// userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    shippingInfo: {}, // Store shipping info here
};

export const userSlice = createSlice({
    initialState,
    name: "userSlice",
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
        setIsAuthenticated(state, action) {
            state.isAuthenticated = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setShippingInfo(state, action) {
            state.shippingInfo = action.payload; // Set shipping info when fetched from the backend
        },
        clearUser(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.shippingInfo = {}; // Clear shipping info on logout
        },
    },
});

export default userSlice.reducer;

export const { setIsAuthenticated, setUser, setLoading, setShippingInfo, clearUser } = userSlice.actions;
