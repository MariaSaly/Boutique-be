/* eslint-disable */

const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const listUsersControllers = require('../controllers/listUserController');
const checkAdmin = require('../middleware/checkAdmin.middleware')


router.get('/list-users',checkAdmin,listUsersControllers.listUsers);
router.post('/add-role',checkAdmin,listUsersControllers.addRole)

module.exports = router;