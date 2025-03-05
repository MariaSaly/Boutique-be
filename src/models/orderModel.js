/* eslint-disable */

const admin = require('firebase-admin');
const db = admin.firestore();

const ORDER_COLLECTION = 'orders';

const orderModel = {
   createModel:async( orderModel)=>{
   
   const orderRef = db.collection(ORDER_COLLECTION).doc();
    await orderRef.set({ id:orderRef.id,...orderModel});
   return orderRef;
   },
   getOrderByUserId: async (userId)=>{
    
     const orderSnapShot= await db.collection(ORDER_COLLECTION).where('userId' , '==',userId).where("deletedAt",'==' , null).get();
     const orders = [];
     orderSnapShot.forEach(doc => orders.push({id:doc.id,...doc.data()}));
     return orders;

   },

   getOrderById: async (orderId) => {
      try {
        const orderDoc = await db.collection(ORDER_COLLECTION).doc(orderId).get();
        
        if (orderDoc.exists) {
          return { id: orderDoc.id, ...orderDoc.data() }; // Return the order as an object
        } else {
          throw new Error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order by ID:", error);
        throw error; // Rethrow the error for further handling
      }
    },
    
   getAllOrders:async()=>{
      const ordersRef = await db.collection(ORDER_COLLECTION).where("deletedAt",'==',null).get();
      const orders = [];
       ordersRef.forEach( doc => orders.push({ id:doc.id,...doc.data()}));
       return orders;
   },
   updateOrderStatus: async (orderId, status)=>{
    const updateAt = admin.firestore.FieldValue.serverTimestamp()
    const orderRef = db.collection(ORDER_COLLECTION).doc(orderId);
    await orderRef.update({status,updateAt})
   },
   updateTrackingId: async (orderId, trackingId) => {
    const updateAt = admin.firestore.FieldValue.serverTimestamp();
    const orderRef = db.collection(ORDER_COLLECTION).doc(orderId);
 
    console.log("Updating order with trackingId:", trackingId);
    try {
       await orderRef.update({ trackingId, updateAt });
       console.log("Tracking ID updated successfully");
    } catch (error) {
       console.error("Error updating trackingId:", error);
       throw error; // rethrow to handle at higher level
    }
 }
, 
   deleteOrder:async(orderId)=>{
    const deletedAt = admin.firestore.FieldValue.serverTimestamp()
    const orderRef = db.collection(ORDER_COLLECTION).doc(orderId);
    await orderRef.update({ deletedAt});
   }
}

module.exports = orderModel;