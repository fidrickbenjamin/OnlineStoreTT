import Cart from "../models/cart.js";

// Save cart items for a user
export const saveCartItems = async (req, res) => {
    const { cartItems } = req.body;
    const userId = req.user._id; // Ensure you have a middleware to get the logged-in user

    try {
        let cart = await Cart.findOne({ user: userId });

        if (cart) {
            // Update the cart for the user
            cart.cartItems = cartItems;
        } else {
            // Create a new cart for the user
            cart = new Cart({
                user: userId,
                cartItems,
            });
        }

        await cart.save();
        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to save cart", error });
    }
};

// Get cart items for a user
export const getCartItems = async (req, res) => {
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "No cart found for this user" });
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch cart", error });
    }
};
