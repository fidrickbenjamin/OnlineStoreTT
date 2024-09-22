import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import { useUpdateAddressMutation } from '../api/userApi'; // Adjust the path as necessary

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

// Async thunk for updating the address
export const updateAddress = createAsyncThunk(
    'me/profile',
    async (updatedInfo, { rejectWithValue }) => {
        try {
            const response = await useUpdateAddressMutation(updatedInfo); // Your API call
            return response.data; // Assuming your API returns the updated user data
        } catch (error) {
            return rejectWithValue(error.response.data.message || "Failed to update address");
        }
    }
);

export const userSlice = createSlice({
    name: "userSlice",
    initialState,
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
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateAddress.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.user = {
                    ...state.user,
                    shippingInfo: action.payload, // Assuming the payload contains the updated shipping info
                };
                toast.success("Shipping information updated successfully");
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            });
    }
});

export default userSlice.reducer;

export const { setIsAuthenticated, setUser, setLoading } = userSlice.actions;
