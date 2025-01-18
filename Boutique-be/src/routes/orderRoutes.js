const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const orderControllers = require('../controllers/orderController');
const authenticateUser = require('../middleware/authenticateUser.middleware');
const checkAdmin = require('../middleware/checkAdmin.middleware')




//Route to create order

router.post('/createOrders',orderControllers.createOrder);

//Route to get orderbyuserId

router.get('/orderByUserId/:userId', orderControllers.getOrders);



//Route to get orderbyuserId

router.patch('/:orderId', orderControllers.updateOrder);

//delete order

router.patch('/deleteOrder/:orderId',orderControllers.deleteOrder);

//getAllorder

router.get('/getAllOrders',orderControllers.getAllOrders);

module.exports = router;