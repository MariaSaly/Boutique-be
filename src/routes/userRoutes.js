const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const checkAdmin = require('../middleware/checkAdmin.middleware')

// create user data 

router.post('/create-user', userController.createUser);


//getallusre


router.get('/getAllUsers',checkAdmin,userController.getAllUser);

//getallusre


router.get('/getUserById',checkAdmin,userController.getUserById);


module.exports = router;