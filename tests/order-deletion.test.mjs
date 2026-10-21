import test, {before, after, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import Order from '../backend/models/order.js';
import Product from '../backend/models/product.js';
import User from '../backend/models/user.js';
import routes from '../backend/routes/order.js';
import * as controllers from '../backend/controllers/orderControllers.js';
import paymentReadiness from '../backend/middlewares/paymentReadiness.js';
import {releaseOrder} from '../backend/services/orderInventory.js';
import {orderDeletion} from '../backend/utils/orderDeletion.js';
const uri=process.env.TEST_MONGO_URI;
if(uri&&!/\/tt_upgrade_test(?:\?|$)/.test(uri))throw Error('Disposable tt_upgrade_test database only');
const integration=(name,fn)=>test(name,{skip:!uri},fn);
const owner={_id:new mongoose.Types.ObjectId(),name:'Deletion test',role:'user'},admin={_id:new mongoose.Types.ObjectId(),name:'Admin',role:'admin'};
const base={inventoryTracked:true,paymentMethod:'CASH',paymentInfo:{status:'Not Paid'},orderStatus:'Pending',expiresAt:new Date(Date.now()+86400000)};
async function invoke(controller,req){let error;const result={};const res={status(code){result.status=code;return this;},json(body){result.body=body;return this;}};await controller(req,res,e=>{error=e;});if(error)throw error;return result;}
async function fixture(method='CASH'){
 const product=await Product.create({name:'Reserved item',price:10,description:'Fixture',images:[{url:'test',public_id:'test'}],category:{main:'Grocery',sub:'Snacks'},seller:'Store',stock:3,user:admin._id});
 const order=await Order.create({...base,paymentMethod:method,paymentInfo:{status:method==='NBD'?'Verifying':method==='PayPal'?'Pending':'Not Paid'},inventoryState:'Reserved',dedupeKey:new mongoose.Types.ObjectId().toString(),user:owner._id,shippingInfo:{address:'Test',city:'Roseau',phoneNo:'+17675550123',zipCode:'N/A',country:'Dominica'},shippingOption:'pickup',itemsPrice:20,taxAmount:3,shippingAmount:0,totalAmount:23,orderItems:[{product:product._id,name:product.name,quantity:2,price:'10',image:'test'}]});
 await Product.updateOne({_id:product._id},{$push:{inventoryAllocations:{order:order._id,quantity:2}}});
 return {product,order,request:{user:owner,params:{id:order._id},body:{}}};
}
before(async()=>{if(uri){await mongoose.connect(uri);await Order.init();await Product.init();}});
after(async()=>{if(uri){await User.deleteMany({});await mongoose.disconnect();}});
beforeEach(async()=>{if(uri){await Order.deleteMany({});await Product.deleteMany({});await User.deleteMany({});}});
test('deletion policy retains payment evidence, fulfilment records and unknown states',()=>{
 assert.equal(orderDeletion(base).allowed,true);
 for(const change of [{paymentInfo:{status:'Paid'}},{paymentInfo:{status:'Refunded'}},{paymentInfo:{status:'Unknown'}},{paymentInfo:{status:'Pending',paidAt:new Date()}},{orderStatus:'Shipped'},{orderStatus:'Delivered'},{deliveredAt:new Date()},{paymentProof:{uploadedAt:new Date(),reviewStatus:'Rejected'}},{paymentInfo:{status:'Pending',id:'payment-id'}},{paymentInfo:{status:'Pending',reference:'provider-order'}},{paymentMethod:'PayPal',expiresAt:undefined},{paymentMethod:'ShopdmPay',expiresAt:undefined},{paymentMethod:'Card'},{inventoryTracked:false}])assert.equal(orderDeletion({...base,...change},true).allowed,false,JSON.stringify(change));
 assert.equal(orderDeletion({...base,paymentMethod:'PayPal'}).allowed,true);
 assert.equal(orderDeletion({...base,paymentMethod:'NBD',paymentInfo:{status:'Verifying'}}).allowed,true);
 assert.equal(orderDeletion({...base,orderStatus:'Processing'}).allowed,false);
 assert.equal(orderDeletion({...base,orderStatus:'Processing'},true).allowed,true);
});
integration('owner deletes an unpaid order and releases its allocation exactly once',async()=>{const {product,order,request}=await fixture();await invoke(controllers.deleteOrder,request);assert.equal(await Order.findById(order._id),null);const p=await Product.findById(product._id).select("+inventoryAllocations");assert.equal(p.stock,5);assert.equal(p.inventoryAllocations.length,0);await assert.rejects(()=>invoke(controllers.deleteOrder,request),/not found/);assert.equal((await Product.findById(product._id)).stock,5);});
integration('non-owner cannot delete or learn another customer’s order',async()=>{const {product,request}=await fixture();await assert.rejects(()=>invoke(controllers.deleteOrder,{...request,user:{...owner,_id:new mongoose.Types.ObjectId()}}),/not found/);assert.equal(await Order.countDocuments(),1);assert.equal((await Product.findById(product._id)).stock,3);});
integration('admin can delete another customer’s unpaid processing order',async()=>{const {order,request,product}=await fixture();order.orderStatus='Processing';await order.save();await assert.rejects(()=>invoke(controllers.deleteOrder,request),/preparing/);await invoke(controllers.deleteOrder,{...request,user:admin});assert.equal(await Order.findById(order._id),null);assert.equal((await Product.findById(product._id)).stock,5);});
integration('unstarted PayPal and NBD without a receipt can be deleted',async()=>{for(const method of ['PayPal','NBD']){const {order,request,product}=await fixture(method);const response=await invoke(controllers.myOrders,{user:owner});assert.equal(response.body.orders.find(row=>String(row._id)===String(order._id)).deletion.allowed,true);await invoke(controllers.deleteOrder,request);assert.equal((await Product.findById(product._id)).stock,5);}});
integration('provider checkout starting before delete preserves the order and stock',async()=>{const {order,request,product}=await fixture('PayPal');await invoke(paymentReadiness,{user:owner,params:{},body:{orderId:order._id}});await assert.rejects(()=>invoke(controllers.deleteOrder,request),/checkout has started/);assert.equal((await Order.findById(order._id)).orderStatus,'Pending');assert.equal((await Product.findById(product._id)).stock,3);});
integration('checkout and delete racing cannot lose a payable order or release twice',async()=>{const {order,request,product}=await fixture('PayPal');const outcomes=await Promise.allSettled([invoke(paymentReadiness,{user:owner,params:{},body:{orderId:order._id}}),invoke(controllers.deleteOrder,request)]);assert.ok(outcomes.some(row=>row.status==='fulfilled'));const remaining=await Order.findById(order._id),stock=(await Product.findById(product._id)).stock;if(remaining){assert.equal(remaining.expiresAt,undefined);assert.equal(stock,3);}else{assert.equal(stock,5);assert.equal(outcomes[0].status,'rejected');}});
integration('duplicate simultaneous deletes restore stock once',async()=>{const {request,product}=await fixture();const results=await Promise.allSettled([invoke(controllers.deleteOrder,request),invoke(controllers.deleteOrder,request)]);assert.equal(results.filter(row=>row.status==='fulfilled').length,1);assert.equal((await Product.findById(product._id)).stock,5);assert.equal(await Order.countDocuments(),0);});
integration('a previously released cancellation can be deleted without stock inflation',async()=>{const {order,request,product}=await fixture();await releaseOrder(order);order.orderStatus='Cancelled';await order.save();await invoke(controllers.deleteOrder,request);assert.equal((await Product.findById(product._id)).stock,5);});
integration('an interrupted delete can resume after cancellation and partial release',async()=>{const {order,request,product}=await fixture();order.orderStatus='Cancelled';order.dedupeKey=undefined;await order.save();await releaseOrder(order);await invoke(controllers.deleteOrder,request);assert.equal((await Product.findById(product._id)).stock,5);assert.equal(await Order.countDocuments(),0);});
integration('payment, receipt, legacy and shipped protection is enforced at DELETE',async()=>{
 for(const update of [{'paymentInfo.status':'Paid'},{'paymentInfo.status':'Refunded'},{'paymentInfo.reference':'provider-session'},{'paymentProof.uploadedAt':new Date(),'paymentProof.reviewStatus':'Pending'},{orderStatus:'Shipped'},{inventoryTracked:false},{paymentMethod:'Card'}]){const {order,request,product}=await fixture();await Order.updateOne({_id:order._id},{$set:update});await assert.rejects(()=>invoke(controllers.deleteOrder,{...request,user:admin}),err=>err.statusCode===409);assert.ok(await Order.findById(order._id));assert.equal((await Product.findById(product._id)).stock,3);}
});
integration('HTTP delete requires sign-in, enforces ownership, and permits owner and admin',async()=>{
 process.env.JWT_SECRET='disposable-deletion-test-key';
 const customer=await User.create({name:owner.name,email:'delete@example.test',password:'DisposablePass123!'}),staff=await User.create({name:'Staff',email:'staff@example.test',password:'DisposablePass123!',role:'admin'});
 const app=express();app.use(express.json());app.use((req,res,next)=>{const cookie=req.headers.cookie||'';req.cookies={token:cookie.replace(/^token=/,'')};next();});app.use('/api/v2',routes);app.use((err,req,res,next)=>res.status(err.statusCode||500).json({message:err.message}));
 const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
 const url=`http://127.0.0.1:${server.address().port}/api/v2`,cookie=user=>({Cookie:`token=${jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'})}`});
 try{const a=await fixture();let response=await fetch(`${url}/orders/${a.order._id}`,{method:'DELETE'});assert.equal(response.status,401);response=await fetch(`${url}/orders/${a.order._id}`,{method:'DELETE',headers:cookie(customer)});assert.equal(response.status,404);await Order.updateOne({_id:a.order._id},{$set:{user:customer._id}});response=await fetch(`${url}/orders/${a.order._id}`,{method:'DELETE',headers:cookie(customer)});assert.equal(response.status,200);const b=await fixture();response=await fetch(`${url}/admin/orders/${b.order._id}`,{method:'DELETE',headers:cookie(customer)});assert.equal(response.status,403);response=await fetch(`${url}/admin/orders/${b.order._id}`,{method:'DELETE',headers:cookie(staff)});assert.equal(response.status,200);}finally{await new Promise(resolve=>server.close(resolve));}
});
