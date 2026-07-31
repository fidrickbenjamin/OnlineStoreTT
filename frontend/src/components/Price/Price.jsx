import "./Price.css";

const Price = ({
    amount,
    currency = "XCD",
    size = "medium"
}) => {
    const [whole, decimal] = Number(amount || 0)
        .toFixed(2)
        .split(".");

    return (
        <span className={`product-price ${size}`}>
            <span className="currency">{currency}</span>
            <span className="whole">
                {Number(whole).toLocaleString()}
            </span>
            <span className="decimal">
                {decimal}
            </span>
        </span>
    );
};

export default Price;