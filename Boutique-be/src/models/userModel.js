const admin = require('firebase-admin');
const db = admin.firestore();
const userCollections = db.collection("users");


class users{
   
       static  async createUser(userData) {
            try {
                console.log("createUser called with:", userData); // Log input
                const { name, email, password, phonenumber } = userData;
                const newUser = {
                    name,
                    email,
                    password,
                    phonenumber,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                };
    
                console.log("Adding user to Firestore:", newUser); // Log newUser data
                const userRef = await userCollections.add(newUser);
                console.log("User added with ID:", userRef.id); // Log Firestore document ID
    
                const userSnapshot = await userRef.get();
                return { id: userRef.id, ...userSnapshot.data() };
            } catch (err) {
                console.error("Error in createUser model:", err); // Log error
                throw err; // Re-throw error for the controller to catch
            }
        }
    
    

   static async getAllUser(){
        const snapshot = await userCollections.get();
        const users = [];
        snapshot.forEach((doc)=>{
            users.push({ id:doc.id,...doc.data()})
        });
        return users;
    }
}

module.exports =  users;