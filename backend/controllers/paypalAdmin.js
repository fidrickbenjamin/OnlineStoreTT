import Order from '../models/order.js';
import {Job} from '../hubs/models.js';
import {PayPalAttempt,paymentStatus} from '../services/paypalCheckout.js';
import ErrorHandler from '../utils/errorHandler.js';
export async function checks(req,res){
 const [attempts,legacy]=await Promise.all([
  PayPalAttempt.find().sort({createdAt:-1}).limit(50).select('-leaseUntil -requestKey -refunds').lean(),
  Order.aggregate([{$match:{paymentMethod:'PayPal','paymentInfo.reference':{$type:'string'}}},{$lookup:{from:PayPalAttempt.collection.name,localField:'_id',foreignField:'target',as:'attempts'}},{$match:{'attempts.0':{$exists:false}}},{$sort:{createdAt:-1}},{$limit:50},{$project:{totalAmount:1,orderStatus:1,'paymentInfo.status':1,'paymentInfo.reference':1,'paymentInfo.id':1}}])
 ]);
 res.json({attempts,legacy,limitedTo:50,webhookConfigured:Boolean(process.env.PAYPAL_WEBHOOK_ID),environment:process.env.PAYPAL_ENV==='live'?'live':'sandbox',currency:'USD',rate:'2.70'});
}
export async function refresh(req,res){
 const {scope,id}=req.body;
 if(!['retail','hub'].includes(scope)||!String(id).match(/^[a-f0-9]{24}$/i))throw new ErrorHandler('Invalid payment target.',400);
 const t=await(scope==='hub'?Job:Order).findById(id);
 if(!t)throw new ErrorHandler('Order not found.',404);
 res.json(await paymentStatus(scope,id,t.user));
}
