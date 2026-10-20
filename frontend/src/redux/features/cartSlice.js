import { createSlice } from "@reduxjs/toolkit";

const readStored = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value === null ? fallback : value; }
  catch { localStorage.removeItem(key); return fallback; }
};
const initialState = {
  cartItems: Array.isArray(readStored("cartItems", [])) ? readStored("cartItems", []) : [],
  shippingInfo: readStored("shippingInfo", {}) || {},
  shippingOption: readStored("shippingOption", "none"),
};


export const cartSlice = createSlice({
    initialState,
    name: "cartSlice",
    reducers: {

                   setShippingOption: (state, action) => {
         state.shippingOption = action.payload;
        localStorage.setItem("shippingOption", JSON.stringify(state.shippingOption));
        },

        setCartItem: (state, action) => {
            const item = action.payload;

            const isItemExist = state.cartItems.find(
                (i) => i.product === item.product
            );

            
            if(isItemExist) {
                    state.cartItems = state.cartItems.map((i) =>
                    i.product === isItemExist.product ? item : i
                    );
            } else {
                state.cartItems = [...state.cartItems, item];
            }

            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

        removeCartItem: (state, action) => {
                state.cartItems = state?.cartItems?.filter((i) => i.product !== action.payload );
                localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

        clearCart: (state, action) => {
            localStorage.removeItem("cartItems");
            state.cartItems = [];
    },

        saveShippingInfo: (state, action) => {
                state.shippingInfo = action.payload
                localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
        },

        
    },
});

export default cartSlice.reducer;

export const { setCartItem, removeCartItem, saveShippingInfo, clearCart, setShippingOption } = cartSlice.actions;