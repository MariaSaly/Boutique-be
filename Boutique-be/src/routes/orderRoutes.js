const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const orderControllers = require('../controllers/orderController');


//Route to create order

router.post('/createOrders', orderControllers.createOrder);

//Route to get orderbyuserId

router.get('/orderByUserId/:id', orderControllers.getOrdersByUserId);

//Route to get orderbyuserId

router.patch('/updateOrderStatus/:id', orderControllers.updateOrderStatus);

module.exports = router;