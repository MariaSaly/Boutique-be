
const order = require("../models/orderModel");
const cart= require('../models/cartModel');
const admin = require('firebase-admin');
const db = admin.firestore();
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
    key_id: "rzp_test_EoH3hlWAoDxXig",
    key_secret: "HrDgcLoWcvfLLzdSwDT9J8Yj",
});


//create order

exports.createOrder = async (req, res) => {
    try {
        const { userId, totalAmount, paymentStatus, deliveryAddress, currency } = req.body;

        // Step 1: Validate Input
        if (!userId || !totalAmount || !paymentStatus || !deliveryAddress) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Step 2: Fetch Cart Items
        const cartItems = await cart.getCartByUserId(userId);
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty or invalid' });
        }

        console.log("Cart Items:", cartItems);

        // Step 3: Generate Razorpay Order
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const razorpayOrder = await razorpay.orders.create(options);

        // Step 4: Create Order Data
        const orderData = {
            userId,
            cartItems,
            totalAmount,
            paymentStatus,
            deliveryAddress,
            status: 'pending',
            razorpayOrderId: razorpayOrder.id, // Razorpay order_id
            deletedAt: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Step 5: Save Order to Database
        await order.createModel(orderData);

        res.status(201).json({ message: 'Order Created Successfully!', razorpayOrder: razorpayOrder });
    } catch (err) {
        console.error("Error Creating Order:", err);
        res.status(500).json({ message: `Internal Server Error: ${err.message}` });
    }
}

,
exports.getOrders = async(req,res)=>{
    try{
     const {userId} = req.params;
      if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

     const orders = await order.getOrderByUserId(userId);
     res.status(200).json({orders})

    }
    catch(err){
        
        res.status(500).json({message:`Internal Server Error:${err}`})
    }
},
exports.updateOrder = async(req,res) => {
    try{
         const {orderId} = req.params;
         console.log("orderId:",orderId);

         const {status} = req.body;
         console.log("status:",status);
         if (!orderId || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
          }
          await order.updateOrderStatus(orderId,status);
          res.status(200).json({ message:"Order updated sucessfully"})
    }
    catch(err){
        
        res.status(500).json({message:`Internal Server Error:${err}`})
    }
},
exports.deleteOrder = async(req,res) => {
    try{
        const{orderId} = req.params;
        await order.deleteOrder(orderId);
        res.status(200).json({ message:"Order deleted sucessfully!"})
    }
    catch(err){
        
        res.status(500).json({message:`Internal Server Error:${err}`})
    }
},
exports.getAllOrders = async(req,res) => {
    try{
       const orders =  await order.getAllOrders();
       res.status(200).json({orders});
    }
    catch(err){
        
        res.status(500).json({message:`Internal Server Error:${err}`})
    }
}