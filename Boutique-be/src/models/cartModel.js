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
            return null;
        }

       const cart = [];
       cartQuerySnapshot.forEach(doc => {
        cart.push({id:doc.id, ...doc.data()});
       })
       return cart;

    } catch (error) {
        console.error('Error in getting cart:', error);
        throw new Error('Failed to fetch cart data');
    }
  },

  async deleteCartItems(userId, productId) {
    try {
        // Validate userId and productId before proceeding
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error("Invalid userId passed to deleteCartItems");
        }
        if (!productId || typeof productId !== 'string' || productId.trim() === '') {
            throw new Error("Invalid productId passed to deleteCartItems");
        }

        console.log('Deleting product from cart for userId:', userId);
        console.log('Product ID to delete:', productId);

        // Get the cart by userId
        const cartRef = db.collection(CART_COLLECTION).doc(userId);  // Use userId directly to reference the document
        const cartSnapshot = await cartRef.get();

        if (!cartSnapshot.exists) {
            console.log(`No cart found for userId: ${userId}`);
            return;
        }

        const cart = cartSnapshot.data();
        console.log("Cart before deletion:", cart);

        // Ensure items is an array
        const currentItems = Array.isArray(cart.items) ? cart.items : [];

        // Find the item to delete by productId
        const itemIndex = currentItems.findIndex(item => item.productId === productId);
        console.log("itemIndex:",itemIndex);

        if (itemIndex === -1) {
            console.log(`Item with productId ${productId} not found in the cart.`);
            return;
        }

        // Remove the item from the array
        currentItems.splice(itemIndex, 1);  // Removes the item at the found index

        // Update the cart with the new list of items
        await cartRef.update({ items: currentItems });

        console.log('Cart updated successfully after product deletion');
    } catch (error) {
        console.error('Error deleting product from cart:', error);
        throw new Error('Failed to delete product from cart');
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

        const cartRef = db.collection(CART_COLLECTION).doc(userId);
        const cartDoc = await cartRef.get();

        let existingItems = [];

        if (cartDoc.exists) {
            const cartData = cartDoc.data();
            existingItems = cartData.items || [];
        }

        // Merge existing items with newCartItems
        for (const newItem of newCartItems) {
            const existingItem = existingItems.find(item => item.productId === newItem.productId);

            if (existingItem) {
                // Update quantity of the existing item
                existingItem.quantity += newItem.quantity;
            } else {
                // Add the new item
                existingItems.push(newItem);
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
        console.log("item:",itemDoc);
        return itemDoc.exists ? itemDoc.data() : null;
    } catch (error) {
        console.error('Error fetching item details:', error);
        throw new Error('Failed to fetch item details');
    }
  }
};

module.exports = cart;
