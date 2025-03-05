/* eslint-disable */

const admin = require('firebase-admin');

exports.listUsers = async (req, res) => {
  try {
    const result = await admin.auth().listUsers(1000); // Get the first 1000 users
    const usersWithRoles = [];

    for (const user of result.users) {
      // Get custom claims (roles) for each user
      const userRecord = await admin.auth().getUser(user.uid);
      const role = userRecord.customClaims ? userRecord.customClaims.role : null;

      usersWithRoles.push({
        uid: user.uid,
        email: user.email,
        role: role, // Add role to the user object
      });
    }

    console.log('Users with roles:', usersWithRoles);
    res.json(usersWithRoles); // Return the list of users with roles
  } catch (err) {
    console.log(`Error in listing users: ${err}`);
    return res.status(500).send('Error fetching users');
  }
};


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