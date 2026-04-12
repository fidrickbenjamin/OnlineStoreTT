// frontend/src/redux/cartReducers.js

import { CART_ADD_ITEM, CART_GET_ITEMS, SAVE_SHIPPING_INFO } from './cartConstants';

const initialState = {
    items: localStorage.getItem("cartItems")
        ? JSON.parse(localStorage.getItem("cartItems"))
        : [],

    shippingInfo: localStorage.getItem("shippingInfo")
        ? JSON.parse(localStorage.getItem("shippingInfo"))
        : {}
};

export const cartReducer = (state = initialState, action) => {
    switch (action.type) {

        case CART_ADD_ITEM:
            return {
                ...state,
                items: action.payload, // ✅ ONLY update items
            };

        case CART_GET_ITEMS:
            return {
                ...state,
                items: action.payload, // ✅ ONLY update items
            };

        case SAVE_SHIPPING_INFO:
            return {
                ...state,
                shippingInfo: action.payload, // ✅ ONLY update shipping here
            };

        default:
            return state;
    }
};