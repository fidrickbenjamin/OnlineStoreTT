import { createSlice } from "@reduxjs/toolkit";

const readStored = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value === null ? fallback : value; }
  catch { localStorage.removeItem(key); return fallback; }
};
const initialState = {
  cartItems: Array.isArray(readStored("cartItems", [])) ? readStored("cartItems", []) : [],
  shippingInfo: readStored("shippingInfo", {}) || {},
  checkoutQuote: null,
  shippingOption: readStored("shippingOption", "none"),
};


export const cartSlice = createSlice({
    initialState,
    name: "cartSlice",
    reducers: {
        setCheckoutQuote: (state, action) => {
            const quote = action.payload;
            if (!quote) { state.checkoutQuote = null; return; }
            const key = items => JSON.stringify(items.map(item => [String(item.product), Number(item.quantity)]).sort((a,b)=>a[0].localeCompare(b[0])));
            if (key(state.cartItems) !== key(quote.orderItems)) return;
            state.checkoutQuote = quote;
            state.cartItems = quote.orderItems.map(item => ({ ...item, price: Number(item.price), regularPrice: item.regularPrice, promotionName: item.promotionName }));
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

                   setShippingOption: (state, action) => {
         state.checkoutQuote = null;
            state.shippingOption = action.payload;
        localStorage.setItem("shippingOption", JSON.stringify(state.shippingOption));
        },

        setCartItem: (state, action) => {
            state.checkoutQuote = null;
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
                state.checkoutQuote = null;
            state.cartItems = state?.cartItems?.filter((i) => i.product !== action.payload );
                localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },

        clearCart: (state, action) => {
            state.checkoutQuote = null;
            localStorage.removeItem("cartItems");
            state.cartItems = [];
            state.shippingInfo = {};
            state.shippingOption = "none";
            localStorage.removeItem("shippingInfo");
            localStorage.removeItem("shippingOption");
    },

        saveShippingInfo: (state, action) => {
                state.checkoutQuote = null;
            state.shippingInfo = action.payload
                localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
        },

        
    },
});

export default cartSlice.reducer;

export const { setCartItem, removeCartItem, saveShippingInfo, clearCart, setShippingOption, setCheckoutQuote } = cartSlice.actions;