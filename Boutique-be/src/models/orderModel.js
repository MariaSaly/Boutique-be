
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
   deleteOrder:async(orderId)=>{
    const deletedAt = admin.firestore.FieldValue.serverTimestamp()
    const orderRef = db.collection(ORDER_COLLECTION).doc(orderId);
    await orderRef.update({ deletedAt});
   }
}

module.exports = orderModel;