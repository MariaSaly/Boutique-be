/* eslint-disable */

const admin = require('firebase-admin');
const serviceAccount = require('../../config/firebase-service-account.json');

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    storageBucket: "gs://mokhedestination.firebasestorage.app"
});

const db = admin.firestore();

module.exports = admin;