const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const listUsersControllers = require('../controllers/listUserController');

router.get('/list-users',listUsersControllers.listUsers)

module.exports = router;