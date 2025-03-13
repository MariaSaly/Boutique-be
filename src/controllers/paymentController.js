/* eslint-disable */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const admin = require('firebase-admin');
const db = admin.firestore();


//initialize razorpay instance 
const razorpay = new Razorpay({
    key_id: "rzp_test_EoH3hlWAoDxXig",
    key_secret: "HrDgcLoWcvfLLzdSwDT9J8Yj",
});

exports.createOrder = async (req, res) => {
    const { amount, currency } = req.body
    try {
        const options = {
            amount: amount * 100,
            currency: currency || "INR",
            receipt: `reciept_${Date.now()}`,
        }
        const order = await razorpay.orders.create(options);
        res.status(200).json(order)

    }
    catch (err) {
        res.status(500).json({ message: "Failed to create order", err });
    }
}


//verify order 

exports.verifyOrder = async (req, res) => {
    try {
        const { order_id, razorpay_payment_id, razorpay_signature, orderId, userId } = req.body;
        console.log("orderid:", order_id);

        const body = `${order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto.createHmac("sha256", "HrDgcLoWcvfLLzdSwDT9J8Yj")
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            const orderRef = db.collection("orders").doc(orderId);
            
            // Fetch the cart items
            const cartRef = db.collection("cart").doc(userId);
            const cartSnapshot = await cartRef.get();

            if (!cartSnapshot.exists) {
                return res.status(400).json({ message: "Cart not found" });
            }

            const cartData = cartSnapshot.data();
            const cartItems = cartData.items || [];

            // Update stock for each item
            const batch = db.batch();
            for (let item of cartItems) {
                const productRef = db.collection("items").doc(item.productId);
                const productSnapshot = await productRef.get();
                console.log("items:",item);
               

                if (!productSnapshot.exists) {
                    console.warn(`Product not found: ${item.productId}`);
                    continue; // Skip if product does not exist
                }

                const productData = productSnapshot.data();
                console.log("items:",item);
                console.log("productData:",productData);
                const newStock = (productData.stock || 0) - item.quantity;

                if (newStock < 0) {
                    return res.status(400).json({ message: `Stock insufficient for product ${item.productId}` });
                }

                batch.update(productRef, { stock: newStock });
            }

            // Execute batch update
            await batch.commit();

            // Update order status
            await orderRef.update({
                status: "paid",
                paymentId: razorpay_payment_id,
                paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
                paymentStatus: 'success'
            });

            // Delete the cart
            await cartRef.delete();

            res.status(200).json({ message: "Payment verified and stock updated successfully" });
        } else {
            res.status(400).json({ message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Failed to verify payment", error });
    }
};
