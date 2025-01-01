const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const orderRoutes = require('./src/routes/orderRoutes')
const path = require("path");
const app = express();

dotenv.config();

//middleware

// Middleware to serve static files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json())

//Routes

app.use('/api/auth',authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders',orderRoutes);

//start server 

const PORT = process.env.PORT || 5000;
app.listen( PORT , () => {
    console.log(`Server is running on port ${PORT}`);
})
