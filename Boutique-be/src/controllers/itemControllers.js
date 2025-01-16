const item = require("../models/itemModel");
const admin = require('firebase-admin');

//create new item 

exports.createItem = async (req,res) => {
    try{
       const {name,price,description,category,isCustomizable,stock} = req.body;
       let imageUrl = [];
       if(req.files){
        imageUrl = req.files.map(file => `/uploads/${file.filename}`);
        console.log("imageUrls:", imageUrl);
       
       }
        
      
       const itemData = {
        name,
        price,
        description,
        imageUrl,
        category,
        isCustomizable,
        stock

    };
       // Create item using the ItemModel (handling both file and other properties)
       const newItem = await item.create(itemData);
       res.status(201).send(newItem);
    }
    catch(err){
        res.status(500).send({ error:`Failed to create item:${err}`});
    }
}
 // get all items 

 exports.getAllItem = async (req,res) => {
    try{
    const  { category,isCustomizable} = req.query;
    const filter = {};
    if(category){
        filter.category = category;
    }
    if(isCustomizable !== undefined){
        filter.isCustomizable = isCustomizable === 'true' ;
    }
  
      
    console.log("filter:",filter);
     const items = await item.getAll(filter);
     res.status(200).send(items)
    }
    catch(err){
        res.status(500).send({ error:`Failed to get all items:${err}`});
    }
 }
 exports.getById = async (req,res) => {
    const {id} = req.params;
    try{
     const result = await item.getById(id);
     res.status(200).send(result)
    }
    catch(error){
        res.status(500).send({ error: `Failed to get itemById:${error}`});
    }
 }
//update an item
const fs = require('fs');
const path = require('path');

exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const {name,price,description,category,isCustomizable,stock} = req.body;
    let imageUrl = null;
    if(req.file){
     imageUrl = `/uploads/${req.file.filename}`;
     console.log("iamgeUrl:", imageUrl)
    }
    try {
        console.log("id:", id);

        // // Fetch the existing item from Firestore
        // const itemRef = admin.firestore().collection('items').doc(id);
        // // console.log("itemRef:",itemRef);
        // const itemDoc = await itemRef.get();
        // // console.log("itemDoc:",itemDoc);

        // // if (!itemDoc.exists) {
        // //     return res.status(404).send({ error: "Item not found" });
        // // }

        // const existingItem = itemDoc.data();
        // console.log("existingItem:",existingItem);
        // let imageUrl = existingItem.imageUrl; // Keep existing image by default
        // console.log("imageUrl:",imageUrl);

        // // Handle new image upload
        
        const itemData = {
            name,
            price,
            description,
            imageUrl,
            category,
            isCustomizable,
            stock
    
        };

        // Prepare the updated data
        // const updatedData = {
        //     ...req.body, // Include other fields from the request body
        //     imageUrl, // Update imageUrl if a new image was uploaded
        //     updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Use Firestore timestamp
        // };

        // Update the item in Firestore
        await item.update(id,itemData);
        res.status(200).send({ message: 'Item updated successfully' });
    } catch (error) {
        console.error("Error updating item:", error.message);
        res.status(500).send({ error: `Failed to update item: ${error.message}` });
    }
};


 //delete an item 

 exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await item.delete(id);
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({ error: `Failed to delete item:${error}` });
    }
}
