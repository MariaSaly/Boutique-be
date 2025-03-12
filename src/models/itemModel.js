/* eslint-disable */

const admin = require('firebase-admin');
const db = admin.firestore();
const itemsCollections = db.collection("items");
const fs = require("fs");
const path = require("path");
//const multer = require("multer");

// const upload = multer({ dest: 'uploads/'})

// Function to save file locally
// const saveFileLocally = (fileBuffer, fileName) => {
//     const filePath = path.join(__dirname, "uploads", fileName);
    
//     // Create directory if it doesn't exist
//     if (!fs.existsSync(path.dirname(filePath))) {
//         fs.mkdirSync(path.dirname(filePath), { recursive: true });
//     }

//     // Write the buffer to the local file system
//     fs.writeFileSync(filePath, fileBuffer);

//     return filePath; // Return the file path
// };

class item{


    static async create (itemData){
        const {name,price,description ,imageUrl,category,subcategory,isCustomizable,stock,vedioLink} = itemData;
        
        const newItem = {
            name,
            price,
            description,
            imageUrl,
            category,
            subcategory,
            stock,            
            isCustomizable,
            deletedAt:null,
            vedioLink,
           
            createdAt:admin.firestore.FieldValue.serverTimestamp(),
        };
        
        

        
        const docRef = await itemsCollections.add(newItem);
        return { id :docRef.id,...newItem}
    }

    static async getAll(filter = {}) {
        let query = itemsCollections;
    
        // Filter by category if provided
        if (filter.category) {
            query = query.where("category", "==", filter.category);
        }
    
        // Filter by subcategory if provided
        if (filter.subcategory) {
            query = query.where("subcategory", "==", filter.subcategory);
        }
    
        // Filter by isCustomizable if provided
        if (filter.isCustomizable) {
            query = query.where("isCustomizable", "==", filter.isCustomizable);
        }
    
        // Ensure the query includes documents where 'deletedAt' is null
        query = query.where("deletedAt", "==", null);
    
        // Execute the query and get the snapshot
        const snapshot = await query.get();
    
        // Map the query results to include document ID
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    
    

    static async getById(id) {
        const itemRef = itemsCollections.doc(id);
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
        const {name,price,description,imageUrl,category,
            stock,            
            isCustomizable} = itemData;
            console.log("itemData:",itemData);
        const itemRef = itemsCollections.doc(id);
        await itemRef.update({
            name,
            description,
            price,
            imageUrl,
            category,
            stock,
            isCustomizable,
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