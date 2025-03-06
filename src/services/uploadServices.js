// const admin = require('firebase-admin');
// const multer = require('multer');
// const path = require('path')
// const os = require('os'); // Import os module
// const fs = require('fs');
// const bucket = admin.storage().bucket("mokhedestination.firebasestorage.app"); // Get the Firebase Storage bucket

// // Multer setup to store uploaded file temporarily
// const upload = multer({ storage: multer.memoryStorage() });

// /**
//  * Upload File to Firebase Storage
//  * @param {Object} file - File object from Multer
//  * @returns {Promise<string>} - Public URL of the uploaded file
//  */

// const uploadFile = async (file) => {
//     return new Promise((resolve, reject) => {
//         if (!file) {
//             return reject("No file uploaded");
//         }

//         const fileName = `${Date.now()}_${file.originalname}`;
//         const fileUpload = bucket.file(fileName);

//         const stream = fileUpload.createWriteStream({
//             metadata: {
//                 contentType: file.mimetype,
//             },
//         });

//         stream.on('error', (error) => {
//             reject(error);
//         });

//         stream.on('finish', async () => {
//             // Make file publicly accessible (Optional)
//             await fileUpload.makePublic();
//             resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
//         });

//         stream.end(file.buffer);
//     });
// };


// module.exports = { upload, uploadFile };
const Busboy = require('busboy');

/**
 * Middleware to handle file uploads using Busboy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const fileUploadMiddleware = (req, res, next) => {
  const busboy = Busboy({ headers: req.headers });
  const files = []; // To store uploaded files
  const fields = {}; // To store non-file fields

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (!filename) {
      file.resume(); // Skip if no file is uploaded
      return;
    }

    const fileBuffer = [];
    file.on('data', (data) => {
      fileBuffer.push(data); // Collect file data chunks
    });

    file.on('end', () => {
      // Store file information
      files.push({
        fieldname,
        filename,
        mimetype,
        buffer: Buffer.concat(fileBuffer), // Combine chunks into a buffer
        size: Buffer.concat(fileBuffer).length,
      });
    });
  });

  busboy.on('field', (fieldname, value) => {
    fields[fieldname] = value; // Store non-file fields
  });

  busboy.on('finish', () => {
    // Attach files and fields to the request object
    req.files = files;
    req.body = fields;
    next(); // Proceed to the next middleware/route handler
  });

  busboy.on('error', (error) => {
    next(error); // Pass errors to Express error handler
  });

  // Pipe the request to Busboy for parsing
  req.pipe(busboy);
};

module.exports = fileUploadMiddleware;


