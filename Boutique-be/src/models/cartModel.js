const admin = require('firebase-admin');
const db = admin.firestore();
const itemsCollections = db.collection("cart");

class cart{
    static async findByUserId(userId){
        
    }
}