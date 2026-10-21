import mongoose from "mongoose";
import Promotion from "../models/promotion.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import {validateCampaign,validateDirectSale,campaignState,priceProduct} from "../utils/promotionRules.js";
import {activeCampaigns} from "../services/promotionPricing.js";
const categories=()=>Product.schema.path("category.main").enumValues.filter(name=>name!=="Property or Real Estate");
async function validated(body){
 let data;try{data=validateCampaign(body,categories());}catch(error){throw new ErrorHandler(error.message,400);}
 if(data.scope==="products"){
  const count=await Product.countDocuments({_id:{$in:data.products},listingType:{$ne:"property"},"category.main":{$ne:"Property or Real Estate"}});
  if(count!==data.products.length)throw new ErrorHandler("Some selected products no longer exist or are property listings.",400);
 }
 return data;
}
export const listPromotions=catchAsyncErrors(async(req,res)=>{
 const campaigns=await Promotion.find().sort({createdAt:-1}).lean();
 const rows=await Order.aggregate([{$match:{"paymentInfo.status":"Paid"}},{$unwind:"$orderItems"},{$match:{"orderItems.campaignId":{$ne:null}}},{$group:{_id:"$orderItems.campaignId",orders:{$addToSet:"$_id"},units:{$sum:"$orderItems.quantity"},revenue:{$sum:{$multiply:[{$convert:{input:"$orderItems.price",to:"double",onError:0,onNull:0}},"$orderItems.quantity"]}},discounts:{$sum:{$multiply:[{$ifNull:["$orderItems.discountPerUnit",0]},"$orderItems.quantity"]}}}}]);
 const metrics=new Map(rows.map(row=>[String(row._id),{paidOrders:row.orders.length,units:row.units,revenue:row.revenue,discounts:row.discounts}]));
 res.json({success:true,campaigns:campaigns.map(campaign=>({...campaign,state:campaignState(campaign),metrics:metrics.get(String(campaign._id))||{paidOrders:0,units:0,revenue:0,discounts:0}})),categories:categories()});
});
export const savePromotion=catchAsyncErrors(async(req,res)=>{
 const data=await validated(req.body);
 let campaign;
 if(req.params.id){
  campaign=await Promotion.findById(req.params.id);
  if(!campaign)throw new ErrorHandler("Promotion not found.",404);
  if(Number(req.body.version)!==campaign.__v)throw new ErrorHandler("This campaign was changed elsewhere. Reload it before saving.",409);
  Object.assign(campaign,data);await campaign.save();
 }else campaign=await Promotion.create({...data,createdBy:req.user._id});
 res.json({success:true,campaign});
});
export const promotionAction=catchAsyncErrors(async(req,res)=>{
 const campaign=await Promotion.findById(req.params.id);
 if(!campaign)throw new ErrorHandler("Promotion not found.",404);
 if(Number(req.body.version)!==campaign.__v)throw new ErrorHandler("This campaign changed. Refresh before continuing.",409);
 if(req.body.action==="duplicate"){
  const data=campaign.toObject();delete data._id;delete data.__v;delete data.createdAt;delete data.updatedAt;
  const copy=await Promotion.create({...data,name:`${campaign.name.slice(0,90)} (copy)`,status:"draft",createdBy:req.user._id});
  return res.json({success:true,campaign:copy});
 }
 const next={pause:"paused",end:"ended",enable:"enabled"}[req.body.action];
 if(!next)throw new ErrorHandler("Unsupported promotion action.",400);
 if(next==="enabled"&&campaign.endsAt<=new Date())throw new ErrorHandler("Set a future end time before enabling this campaign.",400);
 campaign.status=next;await campaign.save();res.json({success:true,campaign});
});
export const previewPromotion=catchAsyncErrors(async(req,res)=>{
 const data=await validated(req.body),now=new Date();
 const proposed={...data,_id:req.body.id&&mongoose.isValidObjectId(req.body.id)?new mongoose.Types.ObjectId(req.body.id):new mongoose.Types.ObjectId(),status:"enabled",startsAt:new Date(+now-1),endsAt:new Date(+now+60000)};
 const filter={listingType:{$ne:"property"},"category.main":{$ne:"Property or Real Estate"},...(data.scope==="products"?{_id:{$in:data.products}}:{"category.main":data.category})};
 const [products,count,others]=await Promise.all([Product.find(filter).limit(200).lean(),Product.countDocuments(filter),activeCampaigns(now)]);
 const campaigns=[...others.filter(campaign=>String(campaign._id)!==String(proposed._id)),proposed];
 res.json({success:true,count,truncated:count>200,rows:products.map(product=>{const offered=priceProduct({...product,directSale:{enabled:false}},[proposed],now),best=priceProduct(product,campaigns,now);return {id:product._id,name:product.name,regularPrice:product.price,campaignPrice:offered.price,appliedPrice:best.price,appliedLabel:best.promotion?.label||"Regular price",note:offered.savings<=0?"No valid reduction: sale must remain above zero and below the regular price.":best.promotion?.id!==String(proposed._id)?"Another offer is better or wins the tie.":"This campaign applies."};})});
});
export const activePromotions=catchAsyncErrors(async(req,res)=>{
 const campaigns=await activeCampaigns();res.set("Cache-Control","no-store").json({success:true,campaigns:campaigns.map(({_id,name,label,bannerText,startsAt,endsAt})=>({_id,name,label,bannerText,startsAt,endsAt})),serverTime:new Date()});
});
export const getDirectSale=catchAsyncErrors(async(req,res)=>{
 const product=await Product.findById(req.params.id).lean();
 if(!product)throw new ErrorHandler("Product not found.",404);
 res.json({success:true,product:{_id:product._id,price:product.price,directSale:product.directSale||{enabled:false}}});
});
export const saveDirectSale=catchAsyncErrors(async(req,res)=>{
 const product=await Product.findById(req.params.id);
 if(!product)throw new ErrorHandler("Product not found.",404);
 if(product.listingType==="property"||product.category?.main==="Property or Real Estate")throw new ErrorHandler("Property listings cannot have checkout promotions.",400);
 let directSale;try{directSale=validateDirectSale(req.body,product.price);}catch(error){throw new ErrorHandler(error.message,400);}
 const result=await Product.updateOne({_id:product._id,price:product.price},{$set:{directSale}});
 if(!result.matchedCount)throw new ErrorHandler("The regular price changed. Refresh before saving this sale.",409);
 res.json({success:true});
});
