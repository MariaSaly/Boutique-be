const users = require("../models/userModel");
const admin = require('firebase-admin');



exports.createUser = async (req, res) => {
    const { name, email, password, phonenumber } = req.body;
    console.log("Received request body:", req.body); // Log request body

    try {
        const userData = {
            name,
            email,
            password,
            phonenumber,
        };

        console.log("Sending user data to model:", userData); // Log userData
        const user = await users.createUser(userData);
        console.log("User created successfully:", user); // Log user creation success

        res.status(200).send(user);
    } catch (err) {
        console.error("Error in createUser controller:", err); // Log error
        res.status(500).json({ message: "Failed to create the user", error: err.message });
    }
};

exports.getAllUser = async (req,res) => {
    try{
      const userData = await users.getAllUser();
      res.status(200).send(userData);
    }
    catch(err){
        res.status(500).json({message:"Failed to get the users"});
    }
}