const admin = require('firebase-admin');

exports.listUsers = async( req,res)=>{
  try{
      const result = await admin.auth().listUsers(1000);
      console.log("users:", result);
      res.json(result)
  }
  catch(err){
    console.log(`Error in listing users${err}`);
  }
}