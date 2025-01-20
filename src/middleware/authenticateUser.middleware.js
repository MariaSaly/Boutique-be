const admin = require("firebase-admin");

async function authenticateUser(req, res, next) {
    //extract token from headers
    const token = req.headers.authorization?.split(' ')[1];
    console.log("token:",token);
   
if (!token) {
      return res.status(410).json({ message:"Authorization token required"});
    }
    try{
           //verify tokenId and decode it 
           const decodeTokenId = await admin.auth().verifyIdToken(token);

           //attach user information to requestbody
           req.user = {
            uid:decodeTokenId.uid,
            email:decodeTokenId.email,
           };

           next();
    }
    catch(err){
        res.status(410).json({
            message:"Invalid or expired token",
            error:err
        });
    }
}


module.exports = authenticateUser;