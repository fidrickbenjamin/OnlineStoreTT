export const getPriceQueryParams = (searchParams, key, value) => {
    const hasValueInParam = searchParams.has(key);

    if(value && hasValueInParam) {
        searchParams.set(key, value);
    } else if(value) {
        searchParams.append(key, value);
    } else if(hasValueInParam) {
        searchParams.delete(key);
    }

    return searchParams;
}; 



export const calculateOrderCost = (cartItems, shippingOption) => {
    const itemsPrice = cartItems?.reduce(
        (acc, item) => acc + item.price * item.quantity, 0
    );

    let shippingPrice = 0;

    if (shippingOption === "roseau" || shippingOption === "portsmouth") {
        shippingPrice = 15;
    }

    const taxPrice = 0.15 * itemsPrice;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    return {
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
    };
};