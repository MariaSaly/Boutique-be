/* eslint-disable */

const express = require('express');

const { signup,login} = require('../controllers/authcontroller');

const router = express.Router();


//signup Route

router.post('/signup',signup);


//login Route

router.post('/login',login);

module.exports = router;