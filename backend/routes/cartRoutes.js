// backend/routes/cartRoutes.js

import express from 'express';
import { addToCart, getCart } from '../controllers/cartController.js';

const router = express.Router();

// Route to add or update a user's cart
router.post('/cart', addToCart);

// Route to get cart by user ID
router.get('/cart/:userId', getCart);

export default router;
