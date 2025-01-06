const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const listUsersControllers = require('../controllers/listUserController');

router.get('/list-users',listUsersControllers.listUsers);
router.post('/add-role',listUsersControllers.addRole)

module.exports = router;