import mongoose from 'mongoose';
import {Job,Business,Menu,StoreCategory,RestaurantAccount} from './models.js';
import {integer,text,fail} from './rules.js';
export const PURCHASES=['food','convenience','hardware'];
export const attentionQueries=(now=new Date())=>({
 acceptance:{kind:{$in:PURCHASES},status:'Requested',businessAccepted:{$ne:true}},
 quote:{status:'Requested'},
 expired:{status:'Quoted','quote.expiresAt':{$lte:now}},
 payment:{payment:'Review',status:{$ne:'Cancelled'}},
 dispatch:{status:'Confirmed',fulfilment:'delivery',driver:null,offeredDriver:null},
 offers:{status:'Confirmed',offeredDriver:{$ne:null}},
 ready:{kind:{$in:PURCHASES},foodReady:true,fulfilment:'delivery',status:{$in:['Confirmed','Assigned']}},
 late:{kind:{$in:PURCHASES},foodReady:{$ne:true},'foodOps.readyEstimateAt':{$lte:now},status:{$in:['Confirmed','Assigned']}},
 refund:{status:'Cancelled',payment:'Paid'},
 cash:{status:{$in:['Completed','Cancelled']},payment:{$in:['Paid','Refunded']},cashWithDriver:true,cashReconciled:{$ne:true}}
});
export function dayRange(value){const date=text(value,10)||new Intl.DateTimeFormat('en-CA',{timeZone:'America/Dominica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const test=new Date(`${date}T12:00:00Z`);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(+test)||test.toISOString().slice(0,10)!==date)fail('Choose a valid Dominica date.');const from=new Date(`${date}T00:00:00-04:00`);return {date,from,to:new Date(+from+86400000)};}
export function jobFilter(q,now=new Date()){
 const parts=[],status=q.status||'active';if(status==='active')parts.push({status:{$nin:['Completed','Cancelled']}});else if(status!=='all'){if(!['Requested','Quoted','Confirmed','Assigned','PickedUp','Completed','Cancelled'].includes(status))fail('Choose a valid job status.');parts.push({status});}
 if(q.kind){if(![...PURCHASES,'ride','delivery'].includes(q.kind))fail('Choose a valid hub.');parts.push({kind:q.kind});}
 if(q.business){if(!mongoose.isValidObjectId(q.business))fail('Choose a valid business.');parts.push({business:q.business});}
 if(q.payment){if(!['Due','Review','Paid','Refunded'].includes(q.payment))fail('Choose a valid payment status.');parts.push({payment:q.payment});}
 if(q.attention){const a=attentionQueries(now)[q.attention];if(!a)fail('Choose a valid attention filter.');parts.push(a);}
 if(q.stage){const stages={received:{kind:{$in:PURCHASES},businessAccepted:{$ne:true}},accepted:{kind:{$in:PURCHASES},businessAccepted:true,'foodOps.preparingAt':null,foodReady:{$ne:true}},preparing:{kind:{$in:PURCHASES},'foodOps.preparingAt':{$ne:null},foodReady:{$ne:true},status:{$nin:['Completed','Cancelled']}},ready:{kind:{$in:PURCHASES},foodReady:true,status:{$nin:['PickedUp','Completed','Cancelled']}}};if(!stages[q.stage])fail('Choose a valid preparation stage.');parts.push(stages[q.stage]);}
 if(q.from||q.to){const createdAt={};if(q.from)createdAt.$gte=dayRange(q.from).from;if(q.to)createdAt.$lt=dayRange(q.to).to;if(createdAt.$gte&&createdAt.$lt&&createdAt.$gte>=createdAt.$lt)fail('The end date must not precede the start date.');parts.push({createdAt});}
 const search=text(q.search,120);if(search){const escaped=search.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),or=['businessName','pickup.community','dropoff.community','pickup.label','dropoff.label'].map(field=>({[field]:{$regex:escaped,$options:'i'}}));if(/^[a-f\d]{24}$/i.test(search))or.push({_id:search});const suffix=search.match(/(?:^|TT-[A-Z]+-)([a-f\d]{6})$/i)?.[1];if(suffix)or.push({$expr:{$regexMatch:{input:{$toString:'$_id'},regex:`${suffix}$`,options:'i'}}});parts.push({$or:or});}
 return parts.length?{$and:parts}:{};
}
export async function summary(req,res){
 const queries=attentionQueries(),labels=Object.keys(queries),[statuses,attention,newRequests,active,foodPreparing,preparing]=await Promise.all([Job.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]),Promise.all(labels.map(key=>Job.countDocuments(queries[key]))),Job.countDocuments({status:'Requested'}),Job.countDocuments({status:{$in:['Confirmed','Assigned','PickedUp']}}),Job.countDocuments({kind:'food','foodOps.preparingAt':{$ne:null},foodReady:{$ne:true},status:{$nin:['Completed','Cancelled']}}),Job.countDocuments({kind:{$in:PURCHASES},'foodOps.preparingAt':{$ne:null},foodReady:{$ne:true},status:{$nin:['Completed','Cancelled']}})]);
 res.set('Cache-Control','private, no-store').json({generatedAt:new Date(),total:statuses.reduce((s,x)=>s+x.count,0),statuses:Object.fromEntries(statuses.map(x=>[x._id,x.count])),metrics:{newRequests,active,foodPreparing,preparing},attention:Object.fromEntries(labels.map((key,i)=>[key,attention[i]]))});
}
export async function jobs(req,res){
 const page=integer(req.query.page||1,1,1000000),limit=integer(req.query.limit||20,1,100),filter=jobFilter(req.query),[rows,total]=await Promise.all([Job.find(filter).select('-requestHash -completionCode -receipt.data').sort({createdAt:-1,_id:-1}).skip((page-1)*limit).limit(limit).lean(),Job.countDocuments(filter)]);
 res.set('Cache-Control','private, no-store').json({jobs:rows,total,page,limit,pages:Math.max(1,Math.ceil(total/limit))});
}
export async function catalogueIssues(req,res){
 const page=integer(req.query.page||1,1,1000000),limit=integer(req.query.limit||20,1,100);
 const hubExpression={$cond:[{$eq:['$store.type','Hardware Store']},'hardware','convenience']};
 const activeCategoryCount={$size:{$filter:{input:'$managedCategory',as:'c',cond:{$and:[{$ne:['$$c.archived',true]},{$eq:['$$c.hub',hubExpression]}]}}}};
 const pipeline=[
  {$match:{archived:{$ne:true}}},
  {$lookup:{from:Business.collection.name,localField:'business',foreignField:'_id',as:'store'}},{$unwind:'$store'},
  {$match:{'store.type':{$in:['Convenience Store','Hardware Store']},'store.archived':{$ne:true}}},
  {$lookup:{from:StoreCategory.collection.name,localField:'categoryId',foreignField:'_id',as:'managedCategory'}},
  {$set:{categoryValid:{$and:[{$ne:[{$ifNull:['$categoryId',null]},null]},{$in:['$categoryId',{$ifNull:['$store.categoryIds',[]]}]},{$gt:[activeCategoryCount,0]}]}}},
  {$match:{categoryValid:false}},
  {$facet:{count:[{$count:'total'}],products:[{$sort:{createdAt:1,_id:1}},{$skip:(page-1)*limit},{$limit:limit},{$project:{_id:1,name:1,business:1,category:1,businessName:'$store.name',hub:hubExpression}}]}}
 ];
 const [data]=await Menu.aggregate(pipeline);res.json({products:data.products,total:data.count[0]?.total||0,page,limit});
}
