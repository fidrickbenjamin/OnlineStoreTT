import mongoose from 'mongoose';
import crypto from 'node:crypto';
import Order from '../models/order.js';
import {Job} from '../hubs/models.js';
import {paypalRequest} from '../utils/paypalApi.js';
import ErrorHandler from '../utils/errorHandler.js';

// A payment attempt is immutable in currency/amount and retained for reconciliation.
const schema = new mongoose.Schema({
 scope:{type:String,enum:['retail','hub'],required:true},target:mongoose.Schema.Types.ObjectId,
 active:{type:Boolean,default:true},requestKey:String,customId:String,reference:String,captureId:String,
 xcdCents:Number,usdCents:Number,rate:{type:String,default:'2.70'},currency:{type:String,default:'USD'},
 state:{type:String,default:'pending'},providerStatus:String,reviewReason:String,manualReview:Boolean,feeUsdCents:Number,netUsdCents:Number,
 createStartedAt:Date,leaseUntil:Date,refunds:[{_id:false,id:String,cents:Number}],refundedCents:{type:Number,default:0},
},{timestamps:true});
schema.index({scope:1,target:1},{unique:true,partialFilterExpression:{active:true}});
schema.index({reference:1},{unique:true,partialFilterExpression:{reference:{$type:'string'}}});
schema.index({captureId:1},{unique:true,partialFilterExpression:{captureId:{$type:'string'}}});
export const PayPalAttempt=mongoose.models.PayPalAttempt||mongoose.model('PayPalAttempt',schema);
const fail=(message,status=409)=>{throw new ErrorHandler(message,status);};
export function usdFromXcdCents(cents){
 if(!Number.isSafeInteger(cents)||cents<=0||cents>100000000000)fail('Invalid order amount.',400);
 const usd=Math.round(cents*10/27);
 if(usd<1)fail('The total is too small for PayPal.',400);
 return usd;
}
export function inspectPayment(order,attempt){
 const units=order.purchase_units||[],unit=units[0],captures=unit?.payments?.captures||[];
 if(order.id!==attempt.reference||units.length!==1||unit.custom_id!==attempt.customId) return {state:'review',reason:'PayPal order reference does not match.'};
 if(unit.amount?.currency_code!=='USD'||unit.amount.value!==(attempt.usdCents/100).toFixed(2))return {state:'review',reason:'PayPal checkout amount or currency does not match.'};
 if(captures.length>1)return {state:'review',reason:'Multiple captures require reconciliation.'};
 const c=captures[0];
 if(c&&(c.amount?.currency_code!=='USD'||c.amount.value!==(attempt.usdCents/100).toFixed(2)||!c.id))return {state:'review',reason:'PayPal captured amount or currency does not match.'};
 if(c?.status==='COMPLETED'&&order.status==='COMPLETED')return {state:'success',capture:c};
 if(c&&['REFUNDED','PARTIALLY_REFUNDED'].includes(c.status))return {state:'refund-check',capture:c};
 if(c&&['DECLINED','FAILED','DENIED'].includes(c.status))return {state:'failed'};
 if(order.status==='VOIDED'&&!c)return {state:'failed'};
 return {state:'pending',canRetry:!c&&['CREATED','APPROVED','PAYER_ACTION_REQUIRED','SAVED'].includes(order.status)};
}
const model=scope=>scope==='hub'?Job:Order;
const total=(scope,t)=>scope==='hub'?t.quote?.totalCents:Math.round(t.totalAmount*100);
const paid=(scope,t)=>scope==='hub'?['Paid','Refunded'].includes(t.payment):['Paid','Refunded'].includes(t.paymentInfo?.status);
async function owned(scope,id,user){
 if(!mongoose.isValidObjectId(id))fail('Invalid order identifier.',400);
 const t=await model(scope).findOne({_id:id,user});
 if(!t||t.paymentMethod!=='PayPal')fail('PayPal order not found.',404);
 return t;
}
async function latest(scope,id){return PayPalAttempt.findOne({scope,target:id}).sort({createdAt:-1,_id:-1});}
function legacyReference(scope,t){return scope==='hub'?t.checkout?.orderId:t.paymentInfo?.reference;}
function response(scope,t,a,extra={}){
 const terminal=scope==='hub'?t.payment:t.paymentInfo?.status;
 let state=terminal==='Refunded'?'refunded':terminal==='Paid'?'success':a?.state||'pending';
 if(a?.state==='review')state='review';
 if(!a&&legacyReference(scope,t)&&!paid(scope,t))state='review';
 const result={state,scope,orderId:String(t._id),orderReference:scope==='hub'?`HUB-${String(t._id).slice(-8).toUpperCase()}`:`TT-${String(t._id).slice(-8).toUpperCase()}`,
 xcdTotal:(a?.xcdCents??total(scope,t))/100,usdTotal:a?a.usdCents/100:null,currency:'USD',rate:'2.70',
 captureId:a?.captureId||undefined,refundedUsd:a?(a.refundedCents||0)/100:0,
 legacy:!a&&Boolean(legacyReference(scope,t)),orderCancelled:scope==='hub'?t.status==='Cancelled':t.orderStatus==='Cancelled'||Boolean(t.cancelRequestedAt),canRetry:false,...extra};
 if(state==='review')result.message='This payment needs store review. Please do not pay again. Contact Tactical Trends.';
 return result;
}
async function applySuccess(a,c){
 const current=await model(a.scope).findById(a.target);
 const previousCapture=a.scope==='hub'?current?.checkout?.captureId:current?.paymentInfo?.id;
 if(!current||total(a.scope,current)!==a.xcdCents||(paid(a.scope,current)&&previousCapture&&previousCapture!==c.id)){
  a.state='review';a.reviewReason='Order total changed or another payment is already recorded. Reconcile received funds.';await a.save();return;
 }
 const breakdown=c.seller_receivable_breakdown;
 for(const [field,value] of [['feeUsdCents',breakdown?.paypal_fee],['netUsdCents',breakdown?.net_amount]]){
  if(value?.currency_code==='USD'&&Number.isFinite(Number(value.value)))a[field]=Math.round(Number(value.value)*100);
 }
 if(a.captureId&&a.captureId!==c.id){a.state='review';a.reviewReason='Capture reference changed.';await a.save();return;}
 a.captureId=c.id;a.state=a.refundedCents>=a.usdCents?'refunded':'success';a.reviewReason=undefined;await a.save();
 if(a.state==='refunded')return;
 if(a.scope==='hub'){
  await Job.updateOne({_id:a.target,payment:{$nin:['Paid','Refunded']},'quote.totalCents':a.xcdCents},{$set:{payment:'Paid',paidAt:new Date(),'checkout.captureId':c.id},$inc:{revision:1},$push:{timeline:{message:'PayPal payment verified in USD. Cancelled requests require refund review.',at:new Date()}}});
 }else{
  // Do not overwrite a cancellation or a later fulfilment state when payment arrives late.
  const set={'paymentInfo.status':'Paid','paymentInfo.provider':'PayPal','paymentInfo.id':c.id,'paymentInfo.reference':a.reference,'paymentInfo.amountXcd':a.xcdCents/100,'paymentInfo.amountPaidByCustomerXcd':a.xcdCents/100,'paymentInfo.paidAt':new Date()};
  await Order.updateOne({_id:a.target,'paymentInfo.status':{$nin:['Paid','Refunded']}},{$set:set,$push:{timeline:{message:'PayPal payment verified in USD. If cancelled, review refund before fulfilment.',createdAt:new Date()}}});
  await Order.updateOne({_id:a.target,orderStatus:'Pending','paymentInfo.id':c.id,cancelRequestedAt:{$exists:false}},{$set:{orderStatus:'Processing'}});
 }
}
async function reconcile(a){
 if(a.manualReview)return {state:'review',canRetry:false};
 if(!a.reference)return {state:'pending',canRetry:false};
 const remote=await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(a.reference)}`);
 const result=inspectPayment(remote,a);
 a.providerStatus=remote.status;
 if(result.state==='success')await applySuccess(a,result.capture);
 else if(result.state==='refund-check'){
  a.captureId=result.capture.id;
  // Refund webhooks supply individually verified refund records; never infer a full refund from a partial one.
  a.state=a.refundedCents>=a.usdCents?'refunded':a.refundedCents>0?'success':'review';
  if(!a.refundedCents)a.reviewReason='Refund detected; awaiting verified refund records.';
  await a.save();
 }else if(a.state!=='success'&&a.state!=='refunded'){
  a.state=result.state;a.reviewReason=result.reason;
  // A definitive decline can start a new attempt, while this reference remains available to webhooks.
  if(result.state==='failed'){
   a.active=false;
   if(a.scope==='retail')await Order.updateOne({_id:a.target,'paymentInfo.status':{$nin:['Paid','Refunded']}},{$set:{'paymentInfo.status':'Failed'}});
  }
  await a.save();
 }
 return result;
}
export async function paymentStatus(scope,id,user){
 const t=await owned(scope,id,user);let a=await latest(scope,id);
 if(!a&&scope==='hub'&&t.checkout?.orderId){a=await adoptHub(t);}
 let extra={};
 if(a?.reference){
  try {const r=await reconcile(a);extra.canRetry=Boolean(r.canRetry)&&Date.now()-new Date(a.createStartedAt)<5*3600000;}
  catch {extra={verificationUnavailable:true,canRetry:false};}
 }
 const fresh=await model(scope).findById(id);
 const blocked=(scope==='hub'?fresh.status==='Cancelled':fresh.orderStatus==='Cancelled'||fresh.cancelRequestedAt)||paid(scope,fresh);
 return response(scope,fresh,a,{...extra,canRetry:!blocked&&!extra.verificationUnavailable&&(a?.state==='failed'||extra.canRetry||(!a&&!legacyReference(scope,fresh)))});
}
async function adoptHub(t){
 const x=t.checkout;
 if(x.currency!=='USD'||x.value!==(usdFromXcdCents(x.amountCents)/100).toFixed(2)||x.amountCents!==t.quote.totalCents)return null;
 try{return await PayPalAttempt.create({scope:'hub',target:t._id,xcdCents:x.amountCents,usdCents:usdFromXcdCents(x.amountCents),reference:x.orderId,customId:`HUB-${t._id}`,requestKey:`legacy-hub-${t._id}`,createStartedAt:x.startedAt||new Date(0)});}
 catch(e){if(e.code!==11000)throw e;return latest('hub',t._id);}
}
export async function beginPayment(scope,id,user){
 await PayPalAttempt.init();
 let t=await owned(scope,id,user);
 if(paid(scope,t))fail('This order is already paid or refunded.');
 if(scope==='hub'?t.status!=='Confirmed'||t.payment==='Review':t.orderStatus==='Cancelled'||t.cancelRequestedAt)fail('This order is not available for payment.');
 let a=await latest(scope,id);
 if(!a&&legacyReference(scope,t)){
  if(scope==='hub')a=await adoptHub(t);
  if(!a)fail('This older PayPal checkout needs an amount review by Tactical Trends before payment. Do not pay it again.');
 }
 if(a?.reference){
  const r=await reconcile(a);
  if(a.state==='success'||a.state==='refunded')fail('Payment is already confirmed. View your order.');
  if(a.state==='review'||r.state==='refund-check')fail('Payment needs reconciliation. Contact Tactical Trends before paying again.');
  if(a.xcdCents!==total(scope,t))fail('The order changed after checkout started. Contact the store.');
  if(a.state!=='failed'){
   if(!r.canRetry)fail('Payment confirmation is pending. Please do not pay again.');
   if(Date.now()-new Date(a.createStartedAt)>5*3600000)fail('This checkout is older than the safe retry window. Contact the store for reconciliation.');
   return {id:a.reference,...response(scope,t,a)};
  }
 }
 if(!a||a.state==='failed'){
  try {a=await PayPalAttempt.create({scope,target:id,requestKey:crypto.randomUUID(),customId:`${scope==='hub'?'HUB':'TT'}-${id}`,xcdCents:total(scope,t),usdCents:usdFromXcdCents(total(scope,t))});}
  catch(e){if(e.code!==11000)throw e;a=await PayPalAttempt.findOne({scope,target:id,active:true});}
 }
 if(!a)fail('Checkout changed. Refresh before continuing.');
 const now=new Date();
 const lease=await PayPalAttempt.findOneAndUpdate({_id:a._id,$or:[{leaseUntil:{$exists:false}},{leaseUntil:{$lt:now}}]},{$set:{leaseUntil:new Date(+now+90000)}},{new:true});
 if(!lease)fail('Checkout is being prepared. Please retry shortly.');
 try {
  a=lease;
  if(a.reference)return {id:a.reference,...response(scope,t,a)};
  if(a.createStartedAt&&Date.now()-a.createStartedAt>5*3600000)fail('Checkout creation needs reconciliation. Contact the store before retrying.');
  if(!a.createStartedAt){a.createStartedAt=now;await a.save();}
  if(scope==='hub'){
   const frozen=await Job.updateOne({_id:id,status:'Confirmed',payment:'Due','quote.totalCents':a.xcdCents},{$set:{'checkout.provider':'PayPal','checkout.amountCents':a.xcdCents,'checkout.currency':'USD','checkout.value':(a.usdCents/100).toFixed(2),'checkout.startedAt':a.createStartedAt}});
   if(!frozen.matchedCount)fail('This request changed. Contact the store before paying.');
  }
  const remote=await paypalRequest('/v2/checkout/orders',{method:'POST',requestId:a.requestKey,body:{intent:'CAPTURE',purchase_units:[{custom_id:a.customId,invoice_id:`TT-${a._id}`,amount:{currency_code:'USD',value:(a.usdCents/100).toFixed(2)}}],application_context:{brand_name:'Tactical Trends Market Place',user_action:'PAY_NOW',shipping_preference:'NO_SHIPPING'}}});
  if(!remote.id)fail('PayPal did not return a checkout reference.',502);
  a.reference=remote.id;await a.save();
  if(scope==='hub')await Job.updateOne({_id:id},{$set:{checkout:{provider:'PayPal',amountCents:a.xcdCents,currency:'USD',value:(a.usdCents/100).toFixed(2),startedAt:a.createStartedAt,orderId:a.reference}}});
  else await Order.updateOne({_id:id},{$set:{'paymentInfo.status':'Pending','paymentInfo.provider':'PayPal','paymentInfo.reference':a.reference,'paymentInfo.amountXcd':a.xcdCents/100}});
  return {id:a.reference,...response(scope,t,a)};
 }finally{await PayPalAttempt.updateOne({_id:a._id},{$unset:{leaseUntil:1}});}
}
export async function capturePayment(scope,id,user,reference){
 const t=await owned(scope,id,user),a=await PayPalAttempt.findOne({scope,target:id,reference});
 if(!a)fail('PayPal checkout is older or does not match. Contact the store before retrying.');
 if(total(scope,t)!==a.xcdCents)fail('The order total changed. Payment requires review.');
 // First read: an earlier request may already have captured despite a lost browser response.
 let r=await reconcile(a);
 if(r.canRetry&&a.state!=='success'&&a.state!=='refunded'){
  if(scope==='hub'?t.status==='Cancelled':t.orderStatus==='Cancelled'||t.cancelRequestedAt)fail('This order was cancelled. Contact the store before payment.');
  try{await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(a.reference)}/capture`,{method:'POST',requestId:`cap-${a._id}`});}
  catch{/* A timeout or an already-captured response is not proof of failure. */}
  r=await reconcile(a);
 }
 const fresh=await model(scope).findById(id);
 return {...response(scope,fresh,a),paid:a.state==='success'};
}
export async function paymentEvent(event){
 const resource=event.resource||{},related=resource.supplementary_data?.related_ids||{};
 let a=related.order_id?await PayPalAttempt.findOne({reference:related.order_id}):null;
 const up=(resource.links||[]).find(l=>l.rel==='up')?.href||'';
 const captureId=related.capture_id||(/\/v2\/payments\/captures\/([^/?]+)/.exec(up)||[])[1]||(!event.event_type?.includes('REFUND')?resource.id:null);
 if(!a&&captureId)a=await PayPalAttempt.findOne({captureId});
 if(!a&&captureId&&event.event_type==='PAYMENT.CAPTURE.REFUNDED'){
  const captured=await paypalRequest(`/v2/payments/captures/${encodeURIComponent(captureId)}`);
  const ref=captured.supplementary_data?.related_ids?.order_id;
  if(ref)a=await PayPalAttempt.findOne({reference:ref});
 }
 if(!a)return false;
 if(event.event_type==='PAYMENT.CAPTURE.REVERSED'){
  a.state='review';a.manualReview=true;a.reviewReason='PayPal reported a payment reversal. Reconcile funds before fulfilment.';await a.save();
  if(a.scope==='hub')await Job.updateOne({_id:a.target,payment:'Paid'},{$set:{payment:'Review'},$inc:{revision:1},$push:{timeline:{message:'PayPal payment reversal reported. Store must reconcile funds.',at:new Date()}}});
  else await Order.updateOne({_id:a.target,'paymentInfo.status':'Paid'},{$set:{'paymentInfo.status':'Verifying'},$push:{timeline:{message:'PayPal payment reversal reported. Store must reconcile funds before fulfilment.',createdAt:new Date()}}});
  return true;
 }
 if(event.event_type==='PAYMENT.CAPTURE.REFUNDED'){
  if(!resource.id||!captureId)return true;
  if(!a.captureId)await reconcile(a);
  const refund=await paypalRequest(`/v2/payments/refunds/${encodeURIComponent(resource.id)}`);
  const parent=(refund.links||[]).find(l=>l.rel==='up')?.href||'';
  if(refund.status!=='COMPLETED'||!parent.endsWith(`/v2/payments/captures/${captureId}`)||a.captureId!==captureId||refund.amount?.currency_code!=='USD')return true;
  const cents=Math.round(Number(refund.amount.value)*100);
  if(!Number.isSafeInteger(cents)||cents<=0||cents>a.usdCents)fail('Invalid PayPal refund amount.',400);
  await PayPalAttempt.updateOne({_id:a._id,'refunds.id':{$ne:refund.id}},{$push:{refunds:{id:refund.id,cents}}});
  a=await PayPalAttempt.findById(a._id);
  const sum=a.refunds.reduce((n,r)=>n+r.cents,0);
  if(sum>a.usdCents){a.state='review';a.reviewReason='Refund total exceeds captured amount.';}
  else {a.refundedCents=sum;a.state=sum===a.usdCents?'refunded':'success';}
  await PayPalAttempt.updateOne({_id:a._id},[{$set:{refundedCents:{$max:[{$ifNull:['$refundedCents',0]},sum]},state:sum===a.usdCents?'refunded':{$cond:[{$eq:['$state','refunded']},'refunded',a.state]},reviewReason:a.reviewReason||null}}]);
  if(sum===a.usdCents){
   if(a.scope==='hub')await Job.updateOne({_id:a.target,payment:'Paid'},{$set:{payment:'Refunded',refundedAt:new Date(),refundMethod:'provider'},$inc:{revision:1}});
   else await Order.updateOne({_id:a.target,'paymentInfo.id':a.captureId},{$set:{'paymentInfo.status':'Refunded','paymentInfo.refundedAt':new Date(),'paymentInfo.refundMethod':'provider'}});
  }
 }else await reconcile(a);
 return true;
}
export async function paymentEvidence(scope,id){
 const a=await latest(scope,id);
 return a?{state:a.state,xcdTotal:a.xcdCents/100,usdTotal:a.usdCents/100,rate:a.rate,currency:'USD',captureId:a.captureId,refundedUsd:(a.refundedCents||0)/100,reviewReason:a.reviewReason}:null;
}
