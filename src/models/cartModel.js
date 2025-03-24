/* eslint-disable */

const admin = require('firebase-admin');
const db = admin.firestore();

const CART_COLLECTION = 'cart';
const ITEM_COLLECTION = 'items';

const cart = {
    async getCartByUserId(userId) {
    try {
            // Ensure the userId is valid
            if (!userId || typeof userId !== 'string' || userId.trim() === '') {
                throw new Error("Invalid userId passed to getCartByUserId");
            }
    
            console.log('Getting cart for userId:', userId);
    
            // Query to find carts where the userId field matches
            const cartQuerySnapshot = await db.collection(CART_COLLECTION)
                .where('userId', '==', userId)
                .get();
    
            // Debugging the snapshot to inspect the returned documents
            console.log('cartQuerySnapshot:', cartQuerySnapshot);
            console.log('Number of docs found:', cartQuerySnapshot.size);
    
            // Check if any documents were found
            if (cartQuerySnapshot.empty) {
                console.log('No cart found for userId:', userId);
                
                // Initialize a new cart for guestId or non-guest users
                const newCart = { userId, items: [] };
                await db.collection(CART_COLLECTION).doc(userId).set(newCart);
    
                // Return the newly created cart
                return [newCart];
            }
    
            // Extract cart data from the query snapshot
            const cart = [];
            cartQuerySnapshot.forEach(doc => {
                cart.push({ id: doc.id, ...doc.data() });
            })
            return cart;
    
        } catch (error) {
            console.error('Error in getting cart:', error);
            throw new Error('Failed to fetch cart data');
        }
    }
    ,

    async deleteCartItems(userId, productId = null, colorPattern = null) {
        try {
            // Validate userId
            if (!userId || typeof userId !== 'string' || userId.trim() === '') {
                throw new Error("Invalid userId passed to deleteCartItems");
            }
    
            console.log('Deleting product(s) from cart for userId:', userId);
    
            // Reference the cart document by userId
            const cartRef = db.collection(CART_COLLECTION).doc(userId.trim());
            const cartSnapshot = await cartRef.get();
    
            if (!cartSnapshot.exists) {
                console.log(`No cart found for userId: ${userId}`);
                return;
            }
    
            if (productId) {
                // Validate productId
                if (typeof productId !== 'string' || productId.trim() === '') {
                    throw new Error("Invalid productId passed to deleteCartItems");
                }
    
                console.log('Product ID to delete:', productId);
    
                // Get the current items array
                const cart = cartSnapshot.data();
                const currentItems = Array.isArray(cart.items) ? cart.items : [];
    
                // Find and remove the item with the specified productId and optional colorPattern
                const itemIndex = currentItems.findIndex(item => 
                    item.productId === productId && 
                    (colorPattern === null || item.colorPattern === colorPattern) // Optional colorPattern
                );
    
                if (itemIndex === -1) {
                    console.log(`Item with productId ${productId} not found in the cart.`);
                    return;
                }
    
                currentItems.splice(itemIndex, 1); // Remove the item
    
                // Update the cart with the remaining items
                await cartRef.update({ items: currentItems });
                console.log('Cart updated successfully after deletion');
            } else {
                // No productId provided: delete the entire cart document
                await cartRef.delete();
                console.log(`Cart for userId ${userId} deleted successfully`);
            }
        } catch (error) {
            console.error('Error deleting product(s) from cart:', error);
            throw new Error('Failed to delete product(s) from cart');
        }
    }
    
    ,
    async updateCart(userId, cartItems) {
        try {
            // Validate userId and cartItems before proceeding
            if (!userId || typeof userId !== 'string' || userId.trim() === '') {
                throw new Error("Invalid userId passed to updateCart");
            }
            console.log('Updating cart for userId:', userId);
            console.log('Cart Items:', cartItems);

            // Ensure the cart document is updated with correct userId and items
            const cartRef = db.collection(CART_COLLECTION).doc(userId);  // Use userId directly to reference the document
            await cartRef.set({ userId, items: cartItems });

            console.log('Cart updated successfully');
        } catch (error) {
            console.error('Error updating cart:', error);
            throw new Error('Failed to update cart');
        }
    },
    async incrementItemQuantity(cartId, productId, size = 'M', isSleeve = false, colorPattern = '-') {
        try {
            if (!cartId || !productId) {
                throw new Error("Invalid input data");
            }
    
            console.log(`Incrementing quantity for productId: ${productId}, size: ${size}, isSleeve: ${isSleeve}, colorPattern: ${colorPattern} in cart: ${cartId}`);
    
            // Fetch the current cart
            const cartRef = db.collection(CART_COLLECTION).doc(cartId);
            const cartSnapshot = await cartRef.get();
    
            if (!cartSnapshot.exists) {
                throw new Error('Cart not found');
            }
    
            const cart = cartSnapshot.data();
            let itemFound = false;
    
            // Check if the item exists in the cart
            cart.items = cart.items || [];
            const itemIndex = cart.items.findIndex(item => 
                item.productId === productId && 
                item.size === size && 
                item.isSleeve === isSleeve && 
                item.colorPattern === colorPattern
            );
    
            if (itemIndex !== -1) {
                // Item found, increment quantity
                cart.items[itemIndex].quantity += 1;
                itemFound = true;
            }
    
            if (!itemFound) {
                throw new Error('Item not found in the cart');
            }
    
            // Update the cart with the new quantity
            await cartRef.update({ items: cart.items });
    
            console.log('Item quantity incremented successfully');
        } catch (error) {
            console.error('Error incrementing item quantity:', error);
            throw new Error('Failed to increment item quantity');
        }
    }
    ,
    async createCart(userId, newCartItems) {
        try {
            if (!userId || typeof userId !== 'string' || userId.trim() === '') {
                throw new Error("Invalid userId passed to updateCart");
            }
    
            console.log('Updating cart for userId:', userId);
            console.log('New Cart Items:', newCartItems);
    
            const cartRef = db.collection(CART_COLLECTION).doc(userId.trim());
            const cartDoc = await cartRef.get();
    
            let existingItems = [];
    
            if (cartDoc.exists) {
                const cartData = cartDoc.data();
                existingItems = cartData.items || [];
            }
    
            // Merge existing items with newCartItems based on productId, size, and isSleeve
            for (const newItem of newCartItems) {
                const existingItem = existingItems.find(item => 
                    item.productId === newItem.productId && item.size === newItem.size && item.isSleeve === (newItem.isSleeve || false)
                );
    
                if (existingItem) {
                    // Update quantity of the existing item with the same size and isSleeve
                    existingItem.quantity += newItem.quantity;
                } else {
                    // Add the new item with size and isSleeve
                    existingItems.push({ ...newItem, isSleeve: newItem.isSleeve || false });
                }
            }
    
            // Save updated cart
            await cartRef.set({ userId, items: existingItems });
    
            console.log('Cart updated successfully');
        } catch (error) {
            console.error('Error updating cart:', error);
            throw new Error('Failed to update cart');
        }
    }
    






    ,

    async getItemDetails(itemId) {
        try {
            // Get item details by itemId
            const itemDoc = await db.collection(ITEM_COLLECTION).doc(itemId).get();
            console.log("item:", itemDoc);
            return itemDoc.exists ? itemDoc.data() : null;
        } catch (error) {
            console.error('Error fetching item details:', error);
            throw new Error('Failed to fetch item details');
        }
    }
};

module.exports = cart;
