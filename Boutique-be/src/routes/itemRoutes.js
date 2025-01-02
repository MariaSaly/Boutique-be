const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const itemControllers = require('../controllers/itemControllers');;
const authenticateUser = require('../middleware/authenticateUser.middleware')

// Configure Multer for disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Specify the folder where you want to store uploaded files
        const uploadFolder = path.join(__dirname,'../../' ,"uploads");
        cb(null, uploadFolder); // Set the destination folder
    },
    filename: (req, file, cb) => {
        // Specify the file name (you can customize this)
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName); // Set the file name
    },
});

// Set up Multer with the diskStorage engine
const upload = multer({ storage: storage });

//define routes

router.post('/createItem',upload.single("image"),authenticateUser, itemControllers.createItem);
router.get('/getItem', itemControllers.getAllItem);
router.put('/updateItem/:id',itemControllers.updateItem);
router.delete('/deleteItem/:id', itemControllers.deleteItem);

module.exports = router;
