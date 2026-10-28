import crypto from 'node:crypto';
import mongoose from 'mongoose';
import {Business,Job,RestaurantAccount} from './models.js';
import {cents,integer,text,fail} from './rules.js';
const id=v=>String(v?._id||v);
export const localDay=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Dominica',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
function dayRange(value){const date=text(value)||localDay();if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(+new Date(`${date}T12:00:00Z`))||new Date(`${date}T12:00:00Z`).toISOString().slice(0,10)!==date)fail('Choose a valid statement date.');const from=new Date(`${date}T00:00:00-04:00`);return {date,from,to:new Date(+from+86400000)};}
function charge(j){
 const store=['convenience','hardware'].includes(j.kind);
 const began=(!store&&j.foodOps?.preparingAt)||j.foodOps?.readyAt||j.foodReady||['PickedUp','Completed'].includes(j.status);
 const amount=j.restaurantDueCents??Math.max(0,j.itemsCents-j.commissionCents);
 const at=(!store&&j.foodOps?.preparingAt)||j.foodOps?.readyAt||j.timeline?.find(t=>/Food is ready|Items collected|completion|complete/i.test(t.message))?.at||j.createdAt;
 return {amount:began?amount:0,at:new Date(at),legacyPaid:Boolean(j.merchantSettled)};
}
export async function accountState(business,date){
 const b=await Business.findById(business).select('name type archived').lean();if(!b)fail('Business not found.',404);
 const [doc,jobs]=await Promise.all([RestaurantAccount.findById(business).lean(),Job.find({business,kind:{$in:['food','convenience','hardware']}}).select('kind businessName itemsCents restaurantDueCents commissionCents foodOps foodReady status payment paymentMethod quote fulfilment merchantSettled createdAt timeline').sort({createdAt:1}).lean()]);
 const range=dayRange(date),entries=doc?.entries||[],reversed=new Set(entries.filter(e=>e.type==='reversal').map(e=>e.reverses));
 let opening=0,charges=0,paid=0,adjustments=0,legacyPaid=0,balance=0;
 const rows=jobs.map(j=>{
  const c=charge(j),jid=id(j),relevant=entries.filter(e=>e.job===jid&&e.type==='review'&&!reversed.has(id(e))),adjust=relevant.reduce((s,e)=>s+e.deltaCents,0);
  const allocated=entries.reduce((s,e)=>s+(e.allocations||[]).filter(a=>a.job===jid).reduce((n,a)=>n+a.amountCents,0),0);
  if(c.amount){const net=c.amount-(c.legacyPaid?c.amount:0);balance+=net;if(c.at<range.from)opening+=net;else if(c.at<range.to){charges+=c.amount;if(c.legacyPaid)legacyPaid+=c.amount;}}
  const lastReview=relevant[relevant.length-1];
  return {id:jid,createdAt:j.createdAt,accruedAt:c.amount?c.at:null,status:j.status,payment:j.payment,paymentMethod:j.paymentMethod,foodCents:j.itemsCents,deliveryCents:j.quote?.feeCents||0,chargeCents:c.amount,paidCents:(c.legacyPaid?c.amount:0)+allocated,adjustmentCents:adjust,outstandingCents:c.amount+adjust-(c.legacyPaid?c.amount:0)-allocated,reviewRequired:j.status==='Cancelled'&&c.amount>0&&!lastReview,reviewReference:lastReview?.reference,legacy:c.legacyPaid,preparing:Boolean(j.foodOps?.preparingAt)};
 });
 for(const e of entries){balance+=e.deltaCents;if(new Date(e.at)<range.from)opening+=e.deltaCents;else if(new Date(e.at)<range.to){if(e.type==='payment')paid-=e.deltaCents;else adjustments+=e.deltaCents;}}
 // Historical statements end at the selected day's midnight. Current balance
 // includes later entries, shown separately so a backdated view cannot hide debt.
 const closing=opening+charges-legacyPaid-paid+adjustments;
 return {business:{id:id(b),name:b.name,type:b.type,archived:Boolean(b.archived)},revision:doc?.revision||0,date:range.date,summary:{openingCents:opening,foodCents:charges,legacyPaidCents:legacyPaid,paymentsCents:paid,adjustmentsCents:adjustments,closingCents:closing,currentBalanceCents:balance,reviewCount:rows.filter(r=>r.reviewRequired).length},orders:rows,entries:entries.map(e=>({...e,id:id(e),reversed:reversed.has(id(e))})),from:range.from,to:range.to};
}
export async function accounts(req,res){const businesses=await Business.find().select('_id').lean();const rows=await Promise.all(businesses.map(b=>accountState(b._id,req.query.date)));res.set('Cache-Control','private, no-store').json({date:dayRange(req.query.date).date,accounts:rows.map(({business,summary})=>({business,summary}))});}
export async function account(req,res){res.set('Cache-Control','private, no-store').json(await accountState(req.params.id,req.query.date));}
export async function addEntry(req,res){
 const v=req.body,requestKey=text(v.requestKey,80);if(!/^[a-zA-Z0-9-]{12,80}$/.test(requestKey))fail('Refresh the payment form and retry.');
 const hash=crypto.createHash('sha256').update(JSON.stringify({...v,revision:undefined})).digest('hex');
 let doc=await RestaurantAccount.findById(req.params.id);const previous=doc?.entries.find(e=>e.requestKey===requestKey);if(previous){if(previous.requestHash!==hash)fail('This payment key was used for different details.',409);return res.json({reused:true,entry:previous});}
 const state=await accountState(req.params.id),revision=integer(v.revision,0,Number.MAX_SAFE_INTEGER);if(revision!==state.revision)fail('Business account changed. Refresh before recording a payment.',409);
 const reference=text(v.reference,160),note=text(v.note,400),recipient=text(v.recipient,100);if(!reference)fail('Enter a payment reference or adjustment reason.');
 const entry={_id:new mongoose.Types.ObjectId(),requestKey,requestHash:hash,type:v.type,reference,note,recipient,by:req.user._id,at:new Date(),recordedAt:new Date(),allocations:[]};
 const active=state.entries.filter(e=>!e.reversed&&e.type!=='reversal');
 if(v.type==='payment'){
  const amount=cents(v.amount);if(amount<=0||amount>state.summary.currentBalanceCents)fail('Payment must be positive and cannot exceed the current business balance.');if(!recipient)fail('Record who received the cash.');
  let ids=v.jobs;if(ids!==undefined&&(!Array.isArray(ids)||ids.length>300||ids.some(x=>!mongoose.isValidObjectId(x))||new Set(ids).size!==ids.length))fail('Choose valid distinct business orders (maximum 300).');
  const selected=state.orders.filter(r=>r.outstandingCents>0&&(!ids?.length||ids.includes(r.id)));if(ids?.length&&ids.some(jid=>!selected.some(r=>r.id===jid)))fail('A selected order is not payable for this business.');
  if(selected.some(r=>r.reviewRequired))fail('Resolve the selected cancelled prepared orders before paying the business.',409);
  const cap=selected.reduce((s,r)=>s+r.outstandingCents,0);if(ids?.length&&amount>cap)fail('Payment exceeds the selected orders’ remaining product balance.');
  let remaining=amount;for(const row of selected){const allocated=Math.min(remaining,row.outstandingCents);if(allocated>0)entry.allocations.push({job:row.id,amountCents:allocated});remaining-=allocated;if(!remaining)break;}
  entry.deltaCents=-amount;
 }else if(v.type==='opening'||v.type==='adjustment'){
  if(v.type==='opening'&&active.some(e=>e.type==='opening'))fail('Opening balance already exists. Use an adjustment or reverse the original entry.',409);
  const amount=cents(v.amount);if(!amount)fail('Enter a positive adjustment amount.');entry.deltaCents=v.direction==='credit'?-amount:amount;
  if(v.type==='opening'){const range=dayRange(v.date);if(range.date>localDay())fail('Opening balance cannot start in the future.');entry.at=new Date(+range.from-1);}
 }else if(v.type==='review'){
  const row=state.orders.find(r=>r.id===v.job);if(!row?.reviewRequired)fail('Choose a cancelled prepared order awaiting review.',409);const approved=cents(v.amount);if(approved>row.chargeCents)fail('Reviewed business amount cannot exceed the original business amount.');
  entry.job=row.id;entry.deltaCents=approved-row.chargeCents;
 }else if(v.type==='reversal'){
  const old=state.entries.find(e=>e.id===v.entry);if(!old||old.type==='reversal'||old.reversed)fail('This entry cannot be reversed.',409);if(old.type==='review'&&state.entries.some(e=>e.type==='payment'&&!e.reversed&&e.allocations?.some(a=>a.job===old.job)))fail('Reverse linked restaurant payments before reversing this review.',409);
  entry.reverses=old.id;entry.deltaCents=-old.deltaCents;entry.allocations=(old.allocations||[]).map(a=>({job:a.job,amountCents:-a.amountCents}));
 }else fail('Choose a supported business account entry.');
 // One document per restaurant makes payment allocation and audit append atomic,
 // without requiring a replica-set transaction or mutating old order amounts.
 if(!doc){try{await RestaurantAccount.create({_id:req.params.id,revision:0,entries:[]});}catch(e){if(e.code!==11000)throw e;}}
 const result=await RestaurantAccount.findOneAndUpdate({_id:req.params.id,revision,'entries.requestKey':{$ne:requestKey}},{$push:{entries:entry},$inc:{revision:1}},{new:true,runValidators:true});
 if(!result){doc=await RestaurantAccount.findById(req.params.id);const same=doc?.entries.find(e=>e.requestKey===requestKey);if(same&&same.requestHash===hash)return res.json({reused:true,entry:same});fail('Business account changed. Refresh before recording another payment.',409);}
 res.status(201).json({entry});
}
const csvCell=v=>'"'+(typeof v==='number'?String(v):String(v??'').replace(/^[=+@\-\t\r]/,"'$&")).replaceAll('"','""')+'"';
export async function exportAccount(req,res){const s=await accountState(req.params.id,req.query.date),rows=[['Business',s.business.name],['Statement date',s.date],['Opening XCD',(s.summary.openingCents/100).toFixed(2)],['Closing XCD',(s.summary.closingCents/100).toFixed(2)],[],['Order','Status','Products / meals XCD','Delivery XCD (excluded)','Business charge XCD','Allocated paid XCD','Remaining XCD','Cancelled review']];for(const r of s.orders)rows.push([r.id,r.status,r.foodCents/100,r.deliveryCents/100,r.chargeCents/100,r.paidCents/100,r.outstandingCents/100,r.reviewRequired?'Required':'']);rows.push([],['Entry ID','Recorded','Effective','Type','Amount XCD','Recipient','Reference','Note','Reversed','Order allocations']);for(const e of s.entries)rows.push([e.id,e.recordedAt,e.at,e.type,e.deltaCents/100,e.recipient,e.reference,e.note,e.reversed?'Yes':'',(e.allocations||[]).map(a=>`${a.job}: ${(a.amountCents/100).toFixed(2)}`).join('; ')]);res.set({'Content-Type':'text/csv; charset=utf-8','Cache-Control':'private, no-store','Content-Disposition':`attachment; filename="business-statement-${s.date}.csv"`}).send('\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n'));}
