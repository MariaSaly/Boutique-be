/* eslint-disable */

const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const orderControllers = require('../controllers/orderController');
const authenticateUser = require('../middleware/authenticateUser.middleware');
const checkAdmin = require('../middleware/checkAdmin.middleware');




//Route to create order

router.post('/createOrders',authenticateUser,orderControllers.createOrder);

//Route to get orderbyuserId

router.get('/orderByUserId/:userId',authenticateUser, orderControllers.getOrders);

//Route to get orderbyuserId

router.get('/orderById/:orderId',checkAdmin, orderControllers.getOrdersById);



//Route to get orderbyuserId

router.patch('/:orderId',orderControllers.updateOrder);

router.patch('/updateTrackingId/:orderId',orderControllers.updateTrackingId)

//delete order

router.delete('/deleteOrder/:orderId',checkAdmin,orderControllers.deleteOrder);

//getAllorder

router.get('/getAllOrders',checkAdmin,orderControllers.getAllOrders);

module.exports = router;