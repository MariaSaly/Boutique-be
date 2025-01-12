const cartModel = require('../models/cartModel');

exports.getCart = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log("userId:", userId);

        const carts = await cartModel.getCartByUserId(userId);
        console.log("carts:", carts);

        if (!carts || carts.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Consolidate items from all carts
        const allItems = carts.flatMap(cart => cart.items.map(item => ({
            ...item,
            cartId: cart.id, // Include cart ID for reference
        })));

        console.log('All items from carts:', allItems);

        // Fetch details for each item
        const ItemDetails = await Promise.all(
            allItems.map(async (item) => {
                const product = await cartModel.getItemDetails(item.productId);
                console.log("product:", product);
                return {
                    ...product,
                    quantity: item.quantity,
                    cartId: item.cartId // Include cart ID for reference
                };
            })
        );

        res.status(200).json(ItemDetails);
    } catch (err) {
        console.error(`Error in getting the cart: ${err}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Validate input
        if (!userId || !productId || typeof quantity !== 'number') {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        console.log(`Getting cart for userId: ${userId}`);

        // Fetch the cart for the user
        const cartQuerySnapshot = await cartModel.getCartByUserId(userId);
        let cart;

        if (cartQuerySnapshot.size > 0) {
            console.log(`Number of docs found: ${cartQuerySnapshot.size}`);
            const cartDocs = cartQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            cart = cartDocs[0]; // Assuming one cart per user; modify if multiple carts are allowed.
        } else {
            console.log('No cart found, initializing a new one.');
            cart = { userId, items: [] };
        }

        console.log('Cart before update:', cart);

        // Ensure cart.items exists as an array
        cart.items = cart.items || [];

        // Check if the item already exists in the cart
        const existingItem = cart.items.find(item => item.productId === productId);

        if (existingItem) {
            // Update the quantity of the existing item
            existingItem.quantity += quantity;
        } else {
            // Add a new item to the cart
            cart.items.push({ productId, quantity });
        }

        console.log('Cart after update:', cart);

        // Persist the updated cart back to Firestore
        await cartModel.createCart(userId, cart.items);

        return res.status(200).json({ message: 'Item added to cart successfully' });
    } catch (err) {
        console.error('Error in addToCart:', err);
        return res.status(500).json({ message: 'Failed to add item to cart', error: err.message });
    }
};

exports.updateCartItems = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Validate input
        if (!userId || !productId || typeof quantity !== 'number') {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        // Fetch the cart for the user
        let cart = await cartModel.getCartByUserId(userId);

        // If cart does not exist, initialize a new one
        if (!cart || cart.length === 0) {
            cart = { userId, items: [] };
        } else {
            // Flatten multiple carts if necessary
            cart = {
                userId,
                items: cart.flatMap(singleCart => singleCart.items),
            };
        }

        console.log('Cart before update:', cart);

        // Check if the item already exists in the cart
        const existingItem = cart.items.find(item => item.productId === productId);

        if (existingItem) {
            // Update the item's quantity
            existingItem.quantity = quantity;
        } else {
            // Add a new item to the cart
            cart.items.push({ productId, quantity });
        }

        console.log('Cart after update:', cart);

        // Persist the updated cart
        await cartModel.updateCart(userId, cart.items);

        return res.status(200).json({ message: 'Cart updated successfully' });
    } catch (err) {
        console.error('Error in updateCartItems:', err);
        return res.status(500).json({ message: 'Failed to update cart', error: err.message });
    }
};

exports.deleteCart = async(req,res) => {
    try{
        const { userId, productId } = req.body;
        await cartModel.deleteCartItems(userId, productId);
        res.status(200).json({ message: 'Item removed from cart' });
    }
    catch(err){
        res.status(500).json({ message: 'Failed to delete cart', err });
    }
}