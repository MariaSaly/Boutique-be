/* eslint-disable */

const item = require("../models/itemModel");
const admin = require('firebase-admin');
//update an item
const fs = require('fs');
const path = require('path');
const multer = require("multer");
const upload = multer();


const db = admin.firestore();

//create new item 

exports.createItem = async (req, res) => {
    try {
        const { name, price,offerprice, description, category, subcategory, isCustomizable, stock, isStock, vedioLink, colorPattern, isSleeve,isStitched, sizes ,isPattern,isColor} = req.body;
        let imageUrl = req.body.imageUrls || [];
        console.log("sizes:",sizes);
         // Parse sizes into an array
  const sizesArray = sizes.split(',').map(size => size.trim());
  console.log("sizesArray:",sizesArray);


        const itemData = {
            name,
            price,
            offerprice:offerprice || 0,
            description,
            imageUrl,
            category,
            subcategory,
            isCustomizable,
            stock: Number(stock),
            isStock,
            vedioLink: vedioLink || null, // Make vedioLink optional
            colorPattern,
            isSleeve,
            isStitched,
            sizesArray,
            isColor,
            isPattern
        };

        const newItem = await item.create(itemData);
        res.status(201).send(newItem);
    } catch (err) {
        res.status(500).send({ error: `Failed to create item: ${err}` });
    }
};
// get all items 
exports.searchItems = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).send({ error: 'Search query is required' });
        }

        let itemsRef = db.collection('items');

        const querySnapshot = await itemsRef.where('name', '>=', query)
            .where('name', '<=', query + '\uf8ff') // Case-insensitive matching
            .get();
        let items = [];
        querySnapshot.forEach((doc) => {
            items.push({id:doc.id,...doc.data()});
        });
        if (items.lenght === 0) {
            const descriptionSnapshot = await itemsRef
                .where('description', '>=', query)
                .where('description', '<=', query + '\uf8ff')
                .get();
            descriptionSnapshot.forEach((doc) => {
                items.push({id:doc.id,...doc.data()});
            });
            const categorySnapshot = await itemsRef
                .where('category', '>=', query)
                .where('category', '<=', query + '\uf8ff')
                .get();

            categorySnapshot.forEach((doc) => {
                items.push({id:doc.id,...doc.data()});
            });

        }
        // Remove duplicates (if an item is found in multiple fields)
        items = [...new Set(items.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
        // Send the results back to the frontend
        res.status(200).send(items);
    }
    catch (err) {
        res.status(500).send({ message: ` Search result not found${err}` });
    }
}
exports.getAllItem = async (req, res) => {
    try {
        const { category, isCustomizable,subcategory } = req.query;
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if(subcategory){
            filter.subcategory = subcategory;
        }
        if (isCustomizable !== undefined) {
            filter.isCustomizable = isCustomizable ;
        }


        console.log("filter:", filter);
        const items = await item.getAll(filter);
        res.status(200).send(items)
    }
    catch (err) {
        res.status(500).send({ error: `Failed to get all items:${err}` });
    }
}
exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await item.getById(id);
        res.status(200).send(result)
    }
    catch (error) {
        res.status(500).send({ error: `Failed to get itemById:${error}` });
    }
}




exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { name, price,offerprice, description, category, subcategory, isCustomizable, stock, isStock, vedioLink, isSleeve,isStitched, colorPattern, sizes ,isPattern,isColor} = req.body;
    let imageUrls = req.body.imageUrls || [];
    const sizesArray = sizes.split(',').map(size => size.trim());
    try {
        const itemRef = admin.firestore().collection('items').doc(id);
        const itemDoc = await itemRef.get();

        if (!itemDoc.exists) {
            return res.status(404).send({ error: "Item not found" });
        }

        const existingItem = itemDoc.data();
        let updatedImageUrls = existingItem.imageUrl || [];

        if (imageUrls && imageUrls.length > 0) {
            if (existingItem.imageUrl && existingItem.imageUrl.length > 0) {
                await Promise.all(
                    existingItem.imageUrl.map(async (url) => {
                        try {
                            const filePath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
                            await bucket.file(filePath).delete();
                            console.log(`Deleted old image: ${filePath}`);
                        } catch (error) {
                            console.error(`Failed to delete old image: ${url}`, error);
                        }
                    })
                );
            }
            updatedImageUrls = imageUrls;
        }

        const itemData = {
            name,
            price,
            offerprice:offerprice || 0,
            description,
            imageUrl: updatedImageUrls,
            category,
            subcategory,
            isCustomizable,
            stock: Number(stock),
            isStock,
            vedioLink: vedioLink || null, // Make vedioLink optional
            isSleeve,
            isStitched,
            colorPattern,
            sizesArray,
            isPattern,
            isColor
        };

        await itemRef.update(itemData);
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
