const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');
const app = express();

dotenv.config();

//middleware

app.use(express.json())

//Routes

app.use('/api/auth',authRoutes)

//start server 

const PORT = process.env.PORT || 5000;
app.listen( PORT , () => {
    console.log(`Server is running on port ${PORT}`);
})
