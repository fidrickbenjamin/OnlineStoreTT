import mongoose from 'mongoose';
import crypto from 'node:crypto';
import {MarketplaceDelivery,settings,activeOptions,assertCommunity,defaultRows} from './marketplaceDelivery.js';
import {seedCommunities,findCommunity,normalName,canonicalName} from './communityDirectory.js';
import {Settings} from '../hubs/models.js';
import {communityRate} from '../hubs/deliveryAreas.js';
import {text,integer,cents,fail} from '../hubs/rules.js';
import {groupItems} from '../utils/orderRules.js';
import {deliveryAddress} from '../utils/accountRules.js';
import Product from '../models/product.js';
const publicQuote=q=>{const v=q.toObject?q.toObject():{...q};delete v.driverCents;delete v.audit;delete v.context;return v;};
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},context:String,items:mongoose.Schema.Types.Mixed,address:mongoose.Schema.Types.Mixed,origins:[String],status:{type:String,enum:['Requested','Approved','Declined'],default:'Requested'},feeCents:Number,driverCents:{type:Number,select:false},note:String,expiresAt:Date,revision:{type:Number,default:0},audit:[{by:mongoose.Schema.Types.ObjectId,at:Date,status:String,feeCents:Number,driverCents:Number,note:String}]},{timestamps:true});
schema.index({user:1,createdAt:-1});
export const CheckoutDeliveryQuote=mongoose.model('CheckoutDeliveryQuote',schema);
export const defaults=()=>({enabled:false,dispatchCommunity:'',collectionInstructions:'Wait for Tactical Trends to confirm the collection location and time.',communities:seedCommunities(),communityFees:[],zones:[],dispatchGroups:[]});
export async function configuration(){const s=await settings();return {revision:s.revision,...defaults(),...s.communityConfig};}
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const addressKey=(rows,v)=>[normalName(canonicalName(rows,v.city)),...['address','landmark','deliveryNotes'].map(k=>text(v[k],500).toLowerCase().replace(/\s+/g,' '))];
function contextKey(c,items,address,origins){return hash([groupItems(items),addressKey(c.communities,address),origins]);}
export function originsFor(c,items){const groups=c.dispatchGroups||[],origins=new Set();for(const item of groupItems(items)){const g=groups.find(g=>g.products.includes(item.product));origins.add(canonicalName(c.communities,g?.community||c.dispatchCommunity));}return [...origins].sort();}
export function estimateRoutes(c,hub,items,destination){
 const dest=findCommunity(c.communities,destination),origins=originsFor(c,items);
 if(dest?.mode==='unavailable')return {status:'unavailable',message:'Delivery to this community is temporarily unavailable. Choose collection or contact us.',origins};
 if(!dest||dest.mode==='quote'||origins.some(o=>!o||findCommunity(c.communities,o)?.mode==='unavailable'))return {status:'quote',message:'A delivery quote is required before payment.',origins};
 const legs=origins.map(from=>{
  const base=(c.communityFees||[]).find(r=>r.from===findCommunity(c.communities,from)?.id&&r.to===dest.id);if(base)return {from,to:dest.name,feeCents:base.feeCents,source:'Default community fee'};
  const row=(hub.communityRates||[]).find(r=>findCommunity(c.communities,r.from)?.id===findCommunity(c.communities,from)?.id&&findCommunity(c.communities,r.to)?.id===dest.id);const exact=row?{feeCents:row.deliveryCents??null,source:'Community delivery rate'}:communityRate(hub,'delivery',canonicalName(c.communities,from),dest.name);
  if(exact)return {from,to:dest.name,feeCents:exact.feeCents,source:exact.source};
  const zone=(c.zones||[]).find(z=>z.from===findCommunity(c.communities,from)?.id&&z.destinations.includes(dest.id));
  return {from,to:dest.name,feeCents:zone?.feeCents??null,source:zone?'Delivery zone':'Quote required'};
 });
 if(legs.some(l=>l.feeCents==null))return {status:'quote',origins,legs,message:'One or more pickup routes need a quote. No estimated fee will be charged.'};
 return {status:'priced',origins,legs,feeCents:legs.reduce((n,l)=>n+l.feeCents,0),message:origins.length>1?'Separate delivery legs are included for each pickup community.':'Delivery fee calculated for your selected community.'};
}
export async function checkoutEstimate(items,destination){const c=await configuration();if(!c.enabled)return {enabled:false};return {...estimateRoutes(c,await hubSettings(),items,destination),enabled:true,revision:c.revision};}
// Hub settings have a singleton ID defined by the existing model; reuse the stored row.
async function hubSettings(){return await Settings.findById('hubs').lean()||{};}
export async function resolveCheckoutDelivery(items,option,user,community,address={}){
 const c=await configuration();
 if(option==='pickup')return {label:'Self collection',fee:0,instructions:c.collectionInstructions,estimate:'Wait for collection confirmation',communities:[],source:'collection'};
 if(!c.enabled){const options=await activeOptions();if(option==='community'||option.startsWith('quote-'))fail('Delivery pricing is not configured yet. Choose self collection or contact Tactical Trends.',409);if(!Object.hasOwn(options,option))fail('Choose a currently available delivery option.');assertCommunity(options[option],option,community);return options[option];}
 if(option==='pickup')return {label:'Collect my order',fee:0,instructions:c.collectionInstructions,estimate:'Collection time confirmed after order review',communities:[],source:'collection'};
 const estimate=estimateRoutes(c,await hubSettings(),items,community);
 if(estimate.status==='unavailable')fail(estimate.message,409);
 if(/^quote-[a-f\d]{24}$/.test(option)){
  if(!address?.address)fail('Review your full address before accepting a delivery quote.',409);
  const q=await CheckoutDeliveryQuote.findOne({_id:option.slice(6),user,status:'Approved',expiresAt:{$gt:new Date()}}).lean();
  if(!q||q.context!==contextKey(c,items,{...address,city:community},estimate.origins))fail('The delivery quote expired or your basket, address or dispatch location changed. Request a new quote.',409);
  return {label:'Approved delivery quote',fee:q.feeCents/100,instructions:q.note,estimate:'Time confirmed by Tactical Trends',communities:[canonicalName(c.communities,community)],source:'manual',quoteId:String(q._id),origins:q.origins,revision:q.revision};
 }
 if(option!=='community'||estimate.status!=='priced')fail(estimate.message||'Request a delivery quote before payment.',409);
 return {label:'Community delivery',fee:estimate.feeCents/100,instructions:estimate.message,estimate:'Delivery time confirmed after order review',communities:[canonicalName(c.communities,community)],source:'routes',legs:estimate.legs,origins:estimate.origins,revision:c.revision};
}
export async function publicConfig(req,res){const c=await configuration();res.json({enabled:c.enabled,revision:c.revision,communities:c.communities,dispatchCommunity:c.dispatchCommunity,collectionInstructions:c.collectionInstructions});}
export async function estimate(req,res){const c=await configuration();if(!c.enabled)return res.json({enabled:false});res.json({...estimateRoutes(c,await hubSettings(),req.body.orderItems,req.body.community),enabled:true,revision:c.revision});}
export async function requestQuote(req,res){
 const c=await configuration();if(!c.enabled)fail('Community checkout is not enabled.',409);
 let items,address;try{items=groupItems(req.body.orderItems);address=deliveryAddress(req.body.shippingInfo);}catch(e){fail(e.message);}
 const products=await Product.find({_id:{$in:items.map(i=>i.product)}}).lean();if(items.some(i=>!products.some(p=>String(p._id)===i.product&&p.listingType!=='property'&&p.category?.main!=='Property or Real Estate'&&p.stock>=i.quantity)))fail('A basket item is unavailable. Review your cart.',409);
 const e=estimateRoutes(c,await hubSettings(),items,address.city);if(e.status==='unavailable')fail(e.message,409);
 const context=contextKey(c,items,address,e.origins);let q=await CheckoutDeliveryQuote.findOne({user:req.user._id,context,$or:[{status:'Requested'},{status:'Approved',expiresAt:{$gt:new Date()}}]}).sort({createdAt:-1});
 if(!q){if(await CheckoutDeliveryQuote.countDocuments({user:req.user._id,createdAt:{$gt:new Date(Date.now()-86400000)}})>=20)fail('Too many delivery requests today. Contact Tactical Trends.',429);q=await CheckoutDeliveryQuote.create({user:req.user._id,context,items:items.map(i=>({...i,name:products.find(p=>String(p._id)===i.product).name})),address,origins:e.origins});}
 res.json({quote:publicQuote(q)});
}
export async function myQuotes(req,res){res.json({quotes:await CheckoutDeliveryQuote.find({user:req.user._id}).sort({createdAt:-1}).limit(30).lean().then(rows=>rows.map(publicQuote))});}
export async function adminQuotes(req,res){res.json({quotes:await CheckoutDeliveryQuote.find().select('+driverCents').populate('user','name email').sort({createdAt:-1}).limit(100).lean()});}
export async function reviewQuote(req,res){const v=req.body;if(!['Approved','Declined'].includes(v.status))fail('Approve or decline this request.');const note=text(v.note,500);if(!note)fail('Add delivery instructions or the reason for declining.');if(v.status==='Approved'&&[v.fee,v.driverPay].some(n=>n===''||n==null))fail('Enter the fee and driver payout (zero is allowed).');const values=v.status==='Approved'?{feeCents:cents(v.fee),driverCents:cents(v.driverPay),expiresAt:new Date(Date.now()+integer(v.validHours??24,1,168)*3600000)}:{};if(values.driverCents>values.feeCents)fail('Driver payout cannot exceed the delivery fee.');const q=await CheckoutDeliveryQuote.findOneAndUpdate({_id:req.params.id,revision:integer(v.revision,0,1e9)},{$set:{status:v.status,note,...values},$inc:{revision:1},$push:{audit:{status:v.status,note,...values,by:req.user._id,at:new Date()}}},{new:true});if(!q)fail('Request changed. Refresh and review again.',409);res.json({quote:publicQuote(q)});}
export async function adminConfig(req,res){const c=await configuration(),hub=await hubSettings();const suggestedFees=(hub.communityRates||[]).filter(r=>findCommunity(c.communities,c.dispatchCommunity)&&findCommunity(c.communities,r.from)?.id===findCommunity(c.communities,c.dispatchCommunity)?.id&&r.deliveryCents!=null&&r.deliveryDriverCents!=null).map(r=>({from:findCommunity(c.communities,r.from).id,to:findCommunity(c.communities,r.to)?.id,feeCents:r.deliveryCents,driverCents:r.deliveryDriverCents})).filter(r=>r.to);res.json({settings:{...c,suggestedFees}});}
export async function saveConfig(req,res){
 const v=req.body;if(typeof v.enabled!=='boolean'||!Array.isArray(v.communities)||v.communities.length<1||v.communities.length>500)fail('Provide 1–500 communities.');
 const previous=(await configuration()).communities;const used=new Set(),keys=new Set(),communities=v.communities.map(r=>{if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(r.id)||used.has(r.id)||!text(r.name,80)||!['available','quote','unavailable'].includes(r.mode)||!Array.isArray(r.aliases)||r.aliases.length>15)fail('Check community IDs, names, aliases and delivery modes.');used.add(r.id);const old=previous.find(c=>c.id===r.id),aliasValues=[...r.aliases,...(old&&old.name!==text(r.name,80)?[old.name]:[])];const row={id:r.id,name:text(r.name,80),aliases:[...new Set(aliasValues.map(a=>text(a,80)).filter(Boolean))],mode:r.mode};for(const name of [...new Map([row.name,...row.aliases].map(n=>[normalName(n),n])).values()]){const key=normalName(name);if(!key||keys.has(key))fail(`Community name or alias is repeated: ${name}`);keys.add(key);}return row;});
 const dispatch=findCommunity(communities,v.dispatchCommunity);if(v.enabled&&!dispatch)fail('Select the main stock dispatch community before enabling.');
 const zoneSeen=new Set();if(!Array.isArray(v.zones)||v.zones.length>100)fail('Use up to 100 delivery zones.');const zones=v.zones.map(z=>{if(!used.has(z.from)||!Array.isArray(z.destinations)||!z.destinations.length||z.destinations.some(id=>!used.has(id)))fail('Select valid pickup and destination communities for each zone.');for(const id of z.destinations){const key=`${z.from}|${id}`;if(zoneSeen.has(key))fail('A pickup/destination pair appears in more than one zone.');zoneSeen.add(key);}if(z.fee===''||z.fee==null||z.driverPay===''||z.driverPay==null)fail('Enter a fee and driver payout for every zone.');const feeCents=cents(z.fee),driverCents=cents(z.driverPay);if(driverCents>feeCents)fail('Driver payout cannot exceed the zone fee.');return {name:text(z.name,80)||'Delivery zone',from:z.from,destinations:[...new Set(z.destinations)],feeCents,driverCents};});
 if(!Array.isArray(v.dispatchGroups)||v.dispatchGroups.length>50)fail('Use up to 50 stock dispatch groups.');const assigned=new Set(),dispatchGroups=v.dispatchGroups.map(g=>{if(!findCommunity(communities,g.community)||!Array.isArray(g.products)||!g.products.length||g.products.length>1000)fail('Each dispatch group needs a community and 1–1000 product IDs.');for(const id of g.products){if(!/^[a-f\d]{24}$/.test(id)||assigned.has(id))fail('Product IDs must be valid and belong to only one dispatch group.');assigned.add(id);}return {name:text(g.name,80),community:findCommunity(communities,g.community).id,products:g.products};});
 if(!Array.isArray(v.communityFees||[])||(v.communityFees||[]).length>2000)fail('Use up to 2000 community fees.');const feeKeys=new Set();const communityFees=(v.communityFees||[]).map(r=>{const key=`${r.from}|${r.to}`;if(!used.has(r.from)||!used.has(r.to)||feeKeys.has(key))fail('Default fees need unique valid pickup/destination communities.');feeKeys.add(key);if(r.fee===''||r.fee==null||r.driverPay===''||r.driverPay==null)fail('Enter both customer fee and driver payout.');const feeCents=cents(r.fee),driverCents=cents(r.driverPay);if(driverCents>feeCents)fail('Driver payout cannot exceed the delivery fee.');return {from:r.from,to:r.to,feeCents,driverCents};});
 const communityConfig={communityFees,enabled:v.enabled,dispatchCommunity:dispatch?.id||'',collectionInstructions:text(v.collectionInstructions,500),communities,zones,dispatchGroups};if(!communityConfig.collectionInstructions)fail('Enter collection instructions.');
 const revision=integer(v.revision,0,1e9);let s;try{s=await MarketplaceDelivery.findOneAndUpdate({_id:'marketplace',revision},{$set:{communityConfig},$setOnInsert:{options:defaultRows()},$inc:{revision:1}},{new:true,upsert:revision===0});}catch(e){if(e.code!==11000)throw e;}if(!s)fail('Delivery configuration changed. Refresh and retry.',409);res.json({settings:{revision:s.revision,...communityConfig}});
}

export async function adminProducts(req,res){const search=text(req.query.search,80).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');res.json({products:await Product.find({listingType:{$ne:'property'},'category.main':{$ne:'Property or Real Estate'},...(search?{name:{$regex:search,$options:'i'}}:{})}).select('name').sort({name:1}).limit(100).lean()});}
