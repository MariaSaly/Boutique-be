const item = require("../models/itemModel");

//create new item 

exports.createItem = async (req,res) => {
    try{
       const {name,price,description} = req.body;
       let imageUrl = null;
       if(req.file){
        imageUrl = `/uploads/${req.file.filename}`;
        console.log("iamgeUrl:", imageUrl)
       }
        
      
       const itemData = {
        name,
        price,
        description,
        imageUrl,
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
     const items = await item.getAll();
     res.status(200).send(items)
    }
    catch(err){
        res.status(500).send({ error:`Failed to get all items:${err}`});
    }
 }
//update an item
 exports.updateItem = async (req,res) => {
    const {id}= req.params;
    try{
        console.log("id:",id);
        const result = await item.update(id, req.body);
        res.status(200).send(result);
    }
    catch (error) {
        res.status(500).send({ error: `Failed to update item:${error}`});
      }
 }

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
