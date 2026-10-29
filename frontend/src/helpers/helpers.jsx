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



export const calculateOrderCost = (cartItems, shippingOption, options) => {
    const itemsPrice = cartItems?.reduce(
        (acc, item) => acc + item.price * item.quantity, 0
    );

    let shippingPrice = 0;

    if (shippingOption === "roseau" || shippingOption === "portsmouth") {
        shippingPrice = 15;
    }

    if(options && Object.hasOwn(options,shippingOption)) shippingPrice=Number(options[shippingOption].fee);

    const taxPrice = Math.round((0.15 * itemsPrice + Number.EPSILON) * 100) / 100;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice + Number.EPSILON) * 100) / 100;

    return {
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
    };
};