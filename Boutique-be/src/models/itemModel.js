const admin = require('firebase-admin');
const db = admin.firestore();
const itemsCollections = db.collection("items");

class item{


    static async create (itemData){
        const {name,price,description,imageUrl} = itemData;
        const newItem = {
            name,
            price,
            description,
            imageUrl,
            createdAt:admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await itemsCollections.add(newItem);
        return { id :docRef.id,...newItem}
    }

    static async getAll(){
        const snapshot = await itemsCollections.get();
        return snapshot.docs.map( (doc)=> ({
            id:doc.id,
            ...doc.data(),
        }))
    }

    static async getById(id) {
        const itemRef = itemsCollection.doc(id);
        const doc = await itemRef.get();
        
        if (!doc.exists) {
          throw new Error('Item not found');
        }
      
        // Check if the 'deletedAt' field is null or undefined
        const itemData = doc.data();
        if (itemData.deletedAt !== null && itemData.deletedAt !== undefined) {
          throw new Error('Item has been deleted');
        }
      
        return {
          id: doc.id,
          ...itemData,
        };
      }

    static async update(id,itemData){
        const {name,price,description,imageUrl} = itemData;
        const itemRef = itemsCollections.doc(id);
        await itemRef.update({
            name,
            description,
            price,
            imageUrl,
            updatedAt:admin.firestore.FieldValue.serverTimestamp()
        });
        return { message: "Items updated sucessfully"};
    }

    static async delete(id){
        const itemsRef = itemsCollections.doc(id);
        await itemsRef.update({
            deletedAt:admin.firestore.FieldValue.serverTimestamp(),
            
        });
        return { message: "Item marked as deleted successfully" };
    }

}
module.exports = item;