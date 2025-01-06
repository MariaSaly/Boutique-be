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

exports.addRole = async(req,res) =>{
    // Retrieve user UID and role from the request body
  const { uid, role } = req.body;
  console.log('Received Payload:', req.body); // Verify the payload
  if (!uid || !role) {
    return res.status(400).send('UID and role are required');
  }
    try{
        // Set custom claims for the user
    await admin.auth().setCustomUserClaims(uid, { role });

    console.log(`Role ${role} assigned to user ${uid}`);

    // Respond with success
    return res.status(200).send(`Role ${role} successfully assigned to user ${uid}`);
    }
    catch(err){
        console.log(`Error in adding role to  users${err}`);
    }
}