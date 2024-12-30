const express = require('express');
const router = express.Router()
const itemControllers = require('../controllers/itemControllers');

//define routes

router.post('/createItem', itemControllers.createItem);
router.get('/getItem', itemControllers.getAllItem);
router.put('/updateItem/:id',itemControllers.updateItem);
router.delete('/deleteItem/:id', itemControllers.deleteItem);

module.exports = router;
