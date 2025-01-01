const order = require("../models/orderModel");
const admin = require('firebase-admin');
const db = admin.firestore();


//create order

exports.createOrder = async (req, res) => {
    try {
        const { cartItems, userId } = req.body;

        // Validate cartItems and userId
        if (!cartItems || !userId) {
            return res.status(400).send({ message: 'Missing required details' });
        }

        // Fetch product details from Firestore 
        const productRef = db.collection('items');

        const productPromises = cartItems.map(async (item) => {
            const productDoc = await productRef.doc(item.productId).get();
            if (productDoc.exists) {
                const productData = productDoc.data();
                return {
                    productId: productDoc.id,
                    productName: productData.name,
                    price: productData.price,
                    quantity: item.qty,
                    totalPrice: productData.price * item.qty,
                };
            } else {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
        });

        // Wait for all the product details to be fetched
        const resolvedProducts = await Promise.all(productPromises);

        // Calculate the total price
        const totalprice = resolvedProducts.reduce((acc, item) => acc + item.totalPrice, 0);

        // Create a new order
        const newOrder = new order( userId,cartItems,totalprice);

        // Save the order and get the orderId
        const orderId = await newOrder.save();

        // Send the response with the orderId
        res.status(201).send({ message: 'Order created successfully', orderId });

    } catch (err) {
        console.log(`Error in creating order: ${err}`);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// get orderbyId

exports.getOrdersByUserId = async (req,res) => {
    try{
       const userId = req.params.id;
       const orders = await order.getOrderByUserId(userId);
       res.status(200).send(orders);
    }
    catch(err){
        console.log(`Error in gettingorderbyid${err}`);
    }
}

exports.updateOrderStatus = async (req,res) => {
    try{
        const userId = req.userId;
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.status(400).send({ message: 'Missing required fields' });
          }
          const response = await Order.updateOrderStatus(orderId, userId, status);
          res.status(200).send(response);
    }
    catch(err){
        console.log(`Error in upadateorderbyid${err}`);
    }
}
