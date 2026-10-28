import {Business,Menu,Job} from './models.js';
import {integer,fail,text} from './rules.js';
const admin=req=>req.user.role==='admin';
export async function archiveBusiness(req,res){
 const b=await Business.findById(req.params.id);if(!b)fail('Business not found.',404);
 const archived=req.body.archived===true;
 const updated=await Business.findOneAndUpdate({_id:b._id,revision:integer(req.body.revision,0,1e9)},{$set:{archived,acceptingOrders:false},$inc:{revision:1}},{new:true});
 if(!updated)fail('Business changed. Refresh and retry.',409);res.json({business:updated});
}
export async function archiveItem(req,res){
 const b=admin(req)&&req.params.id?await Business.findById(req.params.id):await Business.findOne({owner:req.user._id});if(!b)fail('Business not found.',404);
 const item=await Menu.findOneAndUpdate({_id:req.body.item,business:b._id,revision:integer(req.body.revision,0,1e9)},{$set:{archived:true,available:false},$inc:{revision:1}},{new:true});
 if(!item)fail('Item changed or not found. Refresh and retry.',409);res.json({item});
}
// Reductions only: customers explicitly accept the resulting basket and quote.
// Prices, units and handling charges keep their original order snapshots.
export async function reviseBasket(req,res){
 const j=await Job.findById(req.params.id);if(!j)fail('Order not found.',404);
 if(!['convenience','hardware'].includes(j.kind)||j.status!=='Requested'||j.checkout?.startedAt||j.payment!=='Due')fail('Only an unquoted, unpaid store request can be adjusted.',409);
 if(!Array.isArray(req.body.items)||req.body.items.length!==j.items.length)fail('Supply each existing basket row once.');
 const seen=new Set(),items=[];for(const row of req.body.items){if(seen.has(row.menu))fail('Duplicate basket row.');seen.add(row.menu);const old=j.items.find(i=>i.menu===row.menu);if(!old)fail('Choose an existing basket item.');const quantity=integer(row.quantity,0,old.quantity);if(quantity)items.push({...old.toObject(),quantity});}
 if(!items.length)fail('Decline the order if no products can be supplied.');const note=text(req.body.note,300);if(!note)fail('Explain the availability change for the customer.');
 const itemsCents=items.reduce((sum,i)=>sum+i.quantity*i.unitCents,0),handlingCents=j.fulfilment==='collection'?0:items.reduce((sum,i)=>sum+i.quantity*(i.handlingCents||0),0);
 const delta=handlingCents-(j.deliveryEstimate?.handlingCents||0),deliveryEstimate=j.deliveryEstimate?.toObject();if(deliveryEstimate){deliveryEstimate.handlingCents=handlingCents;if(deliveryEstimate.feeCents!=null)deliveryEstimate.feeCents+=delta;deliveryEstimate.quoteRequired=items.some(i=>i.deliveryClass==='quote');}
 const updated=await Job.findOneAndUpdate({_id:j._id,revision:integer(req.body.revision,0,1e9),status:'Requested',payment:'Due','checkout.startedAt':{$exists:false}},{$set:{items,itemsCents,restaurantDueCents:itemsCents,deliveryEstimate,businessAccepted:false},$inc:{revision:1},$push:{timeline:{message:`Store availability update: ${note}. Product subtotal changed from XCD ${(j.itemsCents/100).toFixed(2)} to XCD ${(itemsCents/100).toFixed(2)}. Review the updated basket before accepting the final quote.`,at:new Date()}}},{new:true,runValidators:true});
 if(!updated)fail('Order changed. Refresh and retry.',409);res.json({success:true});
}
