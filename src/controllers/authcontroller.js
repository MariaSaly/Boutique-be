/* eslint-disable */

const admin = require('../services/firebaseService');
const jwt = require('jsonwebtoken');


//signup - register a new user

const signup = async(req,res)=> {
    const { email,password} =  req.body;
    try{
     const userRecord = await admin.auth().createUser({
        email,
        password,
     });

     admin.auth().generateEmailVerificationLink(email);
     res.status(201).json({
        message:"User created sucessfully.Please verify your email",
        user:userRecord,
     });
    }
    catch(error){
        res.status(400).json({ error: error.message})
    }
};


//login - authenticate the user

const login = async ( req,res) => {
 const { email,password} = req.body;
 try{
  const user = await admin.auth().getUserByEmail(email);

  //generate the token 
  const token = jwt.sign(
   {uid:user.uid , email: user.email},
   process.env.JWT_SECRET,
   { expiresIn:'1h'},
  )
  res.status(200).json({
    message:'Login sucessful',
    user:user,
    token:token
  })
 }
 catch(error){
    res.status(400).json({ error:error.message})
 }
}

module.exports = {signup,login};