const { onRequest } = require("firebase-functions/v2/https"); // ✅ Use Firebase v2
const { setGlobalOptions } = require("firebase-functions/v2/options");

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const authRoutes = require('../src/routes/authRoutes');
const itemRoutes = require('../src/routes/itemRoutes');
const orderRoutes = require('../src/routes/orderRoutes');
const listUserRoute = require('../src/routes/listUsersRoute');
const CartRoutes = require('../src/routes/cartRoutes');
const paymentRoutes = require('../src/routes/paymentRoutes');
const userRoutes = require('../src/routes/userRoutes');

const path = require("path");

const app = express();

// Enable CORS
app.use(cors({
    origin: 'https://same-pinch.com',  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Hello, Cloud Run is working!');
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', listUserRoute);
app.use('/api/cart', CartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);

// Start server locally (Only for local dev)
// if (process.env.NODE_ENV !== 'production') {
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//         console.log(`Server running locally on port ${PORT}`);
//     });
// }

// ✅ Set Global Memory & Timeout
setGlobalOptions({ memory: "2GB", timeoutSeconds: 300 });

// ✅ Export the Cloud Function using Firebase v2
exports.api = onRequest(app);
