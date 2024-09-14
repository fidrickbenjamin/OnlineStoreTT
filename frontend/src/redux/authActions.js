// frontend/src/redux/authActions.js

export const logout = () => (dispatch) => {
    // Clear user and cart data
    dispatch({ type: 'CLEAR_USER' });
    dispatch({ type: 'CLEAR_CART' });
};
