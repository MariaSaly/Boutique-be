const express = require('express');
const CartController = require('../controllers/cartController');
const router = express.Router();

router.get('/getCart/:id', CartController.getCart); // Get cart by user ID
router.post('/addCart', CartController.addToCart); // Add item to cart
router.patch('/updateCart', CartController.updateCartItems); // Update cart item quantity
router.delete('/deleteCart/:userId/:productId', CartController.deleteCart); // Remove item from cart

module.exports = router;