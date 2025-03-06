const express = require('express');
const router = express.Router();
const fileParser = require('express-multipart-file-parser');
const bodyParser = require('body-parser');
const { Readable } = require('stream');
const admin = require('firebase-admin');
const itemControllers = require('../controllers/itemControllers');
const authenticateUser = require('../middleware/authenticateUser.middleware');
const checkAdmin = require('../middleware/checkAdmin.middleware');

const bucket = admin.storage().bucket();

// Middleware
router.use(fileParser); // Use express-multipart-file-parser
router.use(bodyParser.urlencoded({ extended: true }));

/**
 * Upload File to Firebase Storage
 * @param {Object} file - File object from req.files
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject("No file uploaded");
    }

    // Define the file path in Firebase Storage
    const fileName = `${Date.now()}_${file.originalname}`; // Unique file name
    const fileUpload = bucket.file(fileName);

    // Convert the file buffer to a readable stream
    const fileStream = Readable.from(file.buffer);

    // Create a writable stream to upload the file
    const writeStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype, // Set the file's MIME type
      },
    });

    // Handle stream events
    writeStream
      .on('error', (error) => {
        reject(error); // Handle errors
      })
      .on('finish', async () => {
        // Make the file publicly accessible (optional)
        await fileUpload.makePublic();
        // Return the public URL of the uploaded file
        resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
      });

    // Pipe the file stream to Firebase Storage
    fileStream.pipe(writeStream);
  });
};

// Route to handle file uploads
router.post('/createItem', async (req, res) => {
  try {
    console.log("Processing file upload...");

    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Upload files to Firebase Storage
    const fileUrls = await Promise.all(
      req.files.map((file) => uploadFile(file))
    );
    console.log("Files uploaded successfully:", fileUrls);

    // Add file URLs and other fields to the request body
    req.body.imageUrls = fileUrls;

    // Create the item using your controller
    const newItem = await itemControllers.createItem(req, res);
    return res.status(201).json(newItem);

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Other routes
router.get('/getItem', itemControllers.getAllItem);
router.get('/getItemById/:id', itemControllers.getById);
router.get('/searchItems', itemControllers.searchItems);
router.patch('/updateItem/:id', checkAdmin, itemControllers.updateItem);
router.delete('/deleteItem/:id', checkAdmin, itemControllers.deleteItem);

module.exports = router;