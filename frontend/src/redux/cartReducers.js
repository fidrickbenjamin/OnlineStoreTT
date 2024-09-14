// frontend/src/redux/cartReducers.js
import { CART_ADD_ITEM, CART_GET_ITEMS } from './cartConstants';

export const cartReducer = (state = { items: [], shippingInfo: {} }, action) => {
    switch (action.type) {
        case CART_ADD_ITEM:
            return { ...state, items: action.payload.items, shippingInfo: action.payload.shippingInfo };
        case CART_GET_ITEMS:
            return { ...state, items: action.payload.items, shippingInfo: action.payload.shippingInfo };
        default:
            return state;
    }
};
