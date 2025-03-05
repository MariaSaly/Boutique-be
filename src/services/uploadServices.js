const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path')

const bucket = admin.storage().bucket(); // Get the Firebase Storage bucket

// Multer setup to store uploaded file temporarily
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Upload File to Firebase Storage
 * @param {Object} file - File object from Multer
 * @returns {Promise<string>} - Public URL of the uploaded file
 */

const uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject("No file uploaded");
        }

        const fileName = `${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        stream.on('error', (error) => {
            reject(error);
        });

        stream.on('finish', async () => {
            // Make file publicly accessible (Optional)
            await fileUpload.makePublic();
            resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
        });

        stream.end(file.buffer);
    });
};


module.exports = { upload, uploadFile };