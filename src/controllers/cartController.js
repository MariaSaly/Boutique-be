const cartModel = require('../models/cartModel');
const admin = require('firebase-admin');
const db = admin.firestore();

exports.getCart = async (req, res) => {
    try {
        const userId = req.params.id;
        console.log("userId:", userId);

        const { guestId } = req.query; // Get guestId from the request query
        console.log("guestId:", guestId);

        // Fetch the user's cart
        const carts = await cartModel.getCartByUserId(userId);
        console.log("User carts:", carts);

        if (!carts || carts.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // If guestId is provided, handle guest cart merging
        if (guestId) {
            const guestCart = await cartModel.getCartByUserId(guestId);
            console.log("Guest cart:", guestCart);

            if (guestCart && guestCart.length > 0) {
                const mergedItems = await mergeGuestCartToUserCart(guestId, userId);
                console.log("Merged items:", mergedItems);

                // Delete guest cart
                await cartModel.deleteCartItems(guestId);
                console.log(`Guest cart for ${guestId} has been deleted`);

                // Fetch updated user cart after merge
                const updatedCarts = await cartModel.getCartByUserId(userId);
                const updatedItems = updatedCarts.flatMap(cart => cart.items.map(item => ({
                    ...item,
                    cartId: cart.id,
                })));

                console.log("Updated items after merging:", updatedItems);

                // Return merged cart items
                const ItemDetails = await Promise.all(
                    updatedItems.map(async (item) => {
                        const product = await cartModel.getItemDetails(item.productId);
                        return {
                            ...product,
                            productId: item.productId,
                            quantity: item.quantity,
                            cartId: item.cartId,
                        };
                    })
                );

                return res.status(200).json(ItemDetails);
            } else {
                // Delete guest cart if it exists but has no items
                await cartModel.deleteCartItems(guestId);
                console.log(`Guest cart for ${guestId} has been deleted`);
            }
        }

        // Process user's cart normally if no guestId is present
        const allItems = carts.flatMap(cart => cart.items.map(item => ({
            ...item,
            cartId: cart.id,
        })));

        console.log("All items from user carts:", allItems);

        const ItemDetails = await Promise.all(
            allItems.map(async (item) => {
                const product = await cartModel.getItemDetails(item.productId);
                return {
                    ...product,
                    productId: item.productId,
                    quantity: item.quantity,
                    cartId: item.cartId,
                };
            })
        );

        res.status(200).json(ItemDetails);
    } catch (err) {
        console.error("Error in getting the cart:", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Helper function to merge the guest cart with the user's cart
async function mergeGuestCartToUserCart(guestId, userId) {
    try {
        // Validate IDs
        if (!guestId || typeof guestId !== 'string' || guestId.trim() === '') {
            throw new Error("Invalid guestId passed to mergeGuestCartToUserCart");
        }
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error("Invalid userId passed to mergeGuestCartToUserCart");
        }

        console.log('Merging guest cart into user cart');
        console.log('Guest ID:', guestId);
        console.log('User ID:', userId);

        // References to guest and user carts
        const guestCartRef = db.collection('cart').doc(guestId.trim());
        const userCartRef = db.collection('cart').doc(userId.trim());

        // Fetch guest cart
        const guestCartSnapshot = await guestCartRef.get();
        const guestCart = guestCartSnapshot.exists ? guestCartSnapshot.data() : { items: [] };

        console.log('Guest Cart:', guestCart);

        // Fetch user cart
        const userCartSnapshot = await userCartRef.get();
        const userCart = userCartSnapshot.exists ? userCartSnapshot.data() : { items: [] };

        console.log('User Cart:', userCart);

        // Combine items
        const mergedItems = [...userCart.items]; // Start with user cart items
        guestCart.items.forEach(guestItem => {
            const existingItemIndex = mergedItems.findIndex(
                userItem => userItem.productId === guestItem.productId
            );

            if (existingItemIndex > -1) {
                // Merge quantities for duplicate productIds
                mergedItems[existingItemIndex].quantity += guestItem.quantity;
            } else {
                // Add new item from guest cart
                mergedItems.push(guestItem);
            }
        });

        console.log('Merged Cart Items:', mergedItems);

        // Update user cart with merged items
        await userCartRef.set({ items: mergedItems }, { merge: true });

        // Optionally, delete the guest cart
        await guestCartRef.delete();

        console.log('Guest cart merged and deleted successfully');
    } catch (error) {
        console.error('Error merging guest cart to user cart:', error);
        throw new Error('Failed to merge guest cart to user cart');
    }
}


exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, size, quantity } = req.body;

        // Validate input
        if (!userId || !productId || !size || typeof quantity !== 'number') {
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

        // Check if the item with the same `productId` and `size` already exists
        const existingItem = cart.items.find(item => item.productId === productId && item.size === size);

        if (existingItem) {
            // Update the quantity of the existing item
            existingItem.quantity += quantity;
        } else {
            // Add a new item to the cart with size
            cart.items.push({ productId, size, quantity });
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
        const { userId, productId } = req.params;
        await cartModel.deleteCartItems(userId, productId);
        res.status(200).json({ message: 'Item removed from cart' });
    }
    catch(err){
        res.status(500).json({ message: 'Failed to delete cart', err });
    }
}