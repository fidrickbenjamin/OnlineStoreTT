// frontend/src/redux/cartActions.js
import axios from "axios";
import { CART_ADD_ITEM, CART_GET_ITEMS } from "./cartConstants";

// Add Items to Cart
export const addToCart = (userId, items, shippingInfo) => async (dispatch) => {
    try {
        const { data } = await axios.post("/api/cart", { userId, items, shippingInfo });
        dispatch({ type: CART_ADD_ITEM, payload: data.cart });
    } catch (error) {
        console.error(error);
    }
};

// Get Cart by User ID
export const getCart = (userId) => async (dispatch) => {
    try {
        const { data } = await axios.get(`/api/cart/${userId}`);
        dispatch({ type: CART_GET_ITEMS, payload: data.cart });
    } catch (error) {
        console.error(error);
    }
};
