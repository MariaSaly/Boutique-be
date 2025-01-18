const Razorpay = require('razorpay');
const crypto = require('crypto');

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
        const { order_id, razorpay_payment_id, razorpay_signature,orderId,userId } = req.body;
        console.log("orderid:", order_id);

        const body = `${order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto.createHmac("sha256", "HrDgcLoWcvfLLzdSwDT9J8Yj").update(body.toString()).digest("hex");
        if (expectedSignature === razorpay_signature) {
            const orderRef = db.collection("orders").doc(orderId);
            await orderRef.update({
                status: "paid",
                paymentId: razorpay_payment_id,
                paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
                paymentStatus:'success'
            });
            const cartRef = db.collection("cart").doc(userId);
            await cartRef.delete();
            res.status(200).json({ message: " Payment verified sucessfully" });
        }
        else {

            res.status(400).json({ message: "Invalid payment signature" });
        }
    }
    catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Failed to verify payment", error });
    }


}