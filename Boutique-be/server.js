const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const orderRoutes = require('./src/routes/orderRoutes')
const path = require("path");
const app = express();
const cors = require('cors');

dotenv.config();

//Enable cors
app.use(cors({
    origin: 'http://localhost:4200',  // Allow only your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
  }));

//middleware

app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));


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
