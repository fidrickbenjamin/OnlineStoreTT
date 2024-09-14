// frontend/src/components/Cart/CartComponent.js

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, getCart } from '../../redux/cartActions';

const CartComponent = () => {
    const dispatch = useDispatch();
    const { items, shippingInfo } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            dispatch(getCart(user._id));
        }
    }, [dispatch, user]);

    const handleAddToCart = () => {
        const cartItems = [...items]; // get cart items from state
        const shippingData = { ...shippingInfo }; // get shipping info from state
        dispatch(addToCart(user._id, cartItems, shippingData));
    };

    return (
        <div>
            <h2>Shopping Cart</h2>
            {/* Display cart items */}
            {items.map(item => (
                <div key={item.product}>{item.name}</div>
            ))}
            <button onClick={handleAddToCart}>Update Cart</button>
        </div>
    );
};

export default CartComponent;
