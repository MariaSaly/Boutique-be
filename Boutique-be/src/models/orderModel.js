const { error } = require('console');
const admin = require('firebase-admin');
const db = admin.firestore();
const itemsCollections = db.collection("order");


class order{
    constructor( userId,cartItems,totalPrice,status = "pending"){
       this.userId = userId;
       this.cartItems = cartItems;
       this.totalPrice = totalPrice;
       this.status = status;
        this.createdAt=admin.firestore.FieldValue.serverTimestamp()
    }
// save the order
    async save (){
        try{
            const orderRef = itemsCollections.doc();

            orderRef.set({
               userId:this.userId,
               cartItems:this.cartItems,
               totalPrice:this.totalPrice,
               status:this.status,
               createdAt:this.createdAt
            });
            return orderRef.id;
        }
        catch(err){
            console.log(`Error in saving order ${err}`);
        }
      
    }
    // get the order by userId

  static  async getOrderByUserId(userId){
    try{
        const orderSnapShot = await itemsCollections.where('userId' , "==", userId).get();
    const orders = orderSnapShot.docs.map( doc => ({ id:doc.id, ...doc.data()}));
    return orders;
    }
    catch(err){
        console.log(`Error in getting order ${err}`);
    }
    
  }

  // update order status

  static async updateOrderStatus(orderId,userId,status){
    try{
        const orderRef = itemsCollections.doc(orderId);
    const orderDoc = await  orderRef.get();
    if( !orderDoc.exists || orderDoc.data().userId  !== userId){
        throw new Error('Order not found or does not belong to the user');
    }
    await orderRef.update({ status});
    return { message:"Order status updated successfully"}
    }
    catch(err){
        console.log(`Error in updating order ${err}`);
    }
  
  }
}
module.exports = order;