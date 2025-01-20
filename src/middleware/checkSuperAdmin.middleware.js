const admin = require("firebase-admin");

const checkUser = async  (req,res,next) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log("token:",token);
    if (!token) {
        return res.status(401).json({ message:"Authorization token required"});
      }
      try{
           //verify tokenId and decode it 
           const decodeTokenId =  await admin.auth().verifyIdToken(token);
           console.log("decodeTokenId:",decodeTokenId);
           const user = decodeTokenId.role;
           console.log("user:",user);
           if(user === 'SuperAdmin'){
            return next();
           }
           return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
      catch(err){
        res.status(410).json({
            message:"Invalid or expired token",
            error:err
        });
      }
}

module.exports = checkUser