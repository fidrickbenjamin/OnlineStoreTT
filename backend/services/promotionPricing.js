import Promotion from "../models/promotion.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";
import crypto from "node:crypto";
import {groupItems,calculateTotals} from "../utils/orderRules.js";
import {priceProduct} from "../utils/promotionRules.js";
export const activeCampaigns = (now=new Date()) => Promotion.find({status:"enabled",startsAt:{$lte:now},endsAt:{$gt:now}}).sort({_id:1}).lean();
export {priceProduct};
export async function quoteCart(items,shippingOption,userId){
 let grouped;try{grouped=groupItems(items);}catch(error){throw new ErrorHandler(error.message,400);}
 const now=new Date(),campaigns=await activeCampaigns(now);
 const products=await Product.find({_id:{$in:grouped.map(item=>item.product)}});
 const orderItems=grouped.map(item=>{
  const product=products.find(row=>String(row._id)===item.product);
  if(!product||product.listingType==="property"||product.category?.main==="Property or Real Estate")throw new ErrorHandler("A selected product cannot be purchased online.",400);
  if(product.stock<item.quantity)throw new ErrorHandler(`${product.name} no longer has enough available stock. If you already placed an unpaid order, continue it from My Orders.`,409);
  const priced=priceProduct(product,campaigns,now);
  return {product:product._id,name:product.name,quantity:item.quantity,image:product.images?.[0]?.url||"/images/default_product.png",stock:product.stock,price:priced.price.toFixed(2),regularPrice:priced.regularPrice,discountPerUnit:priced.savings,promotionId:priced.promotion?.id,promotionName:priced.promotion?.label,campaignId:priced.promotion?.campaignId};
 });
 let totals;try{totals=calculateTotals(orderItems,shippingOption);}catch(error){throw new ErrorHandler(error.message,400);}
 const totalSavings=Number(orderItems.reduce((sum,item)=>sum+item.discountPerUnit*item.quantity,0).toFixed(2));
 const quoteHash=crypto.createHash("sha256").update(JSON.stringify([String(userId),shippingOption,orderItems.map(item=>[String(item.product),item.quantity,item.price,item.promotionId||""]),totals])).digest("hex");
 return {orderItems,...totals,totalSavings,quoteHash,quotedAt:now};
}
// Compute effective prices in MongoDB before sorting, filtering and pagination.
// Keep the regular price unchanged in storage. Same integer-cent rules as JS.
export function priceExpression(campaigns,now=new Date()){
 const base={$round:[{$multiply:["$price",100]},0]};
 const candidate=(raw,condition)=>({$cond:[{$and:[condition,{$gt:[raw,0]},{$lt:[raw,base]}]},raw,base]});
 const retail={$and:[{$ne:["$listingType","property"]},{$ne:["$category.main","Property or Real Estate"]}]};
 const sale={$round:[{$multiply:[{$ifNull:["$directSale.price",0]},100]},0]};
 const candidates=[base,candidate(sale,{$and:[retail,{$eq:["$directSale.enabled",true]},{$lte:[{$ifNull:["$directSale.startsAt",new Date(0)]},now]},{$gt:[{$ifNull:["$directSale.endsAt",new Date("9999-12-31")]},now]}]})];
 for(const campaign of campaigns){
  const matches=campaign.scope==="products"?{$in:["$_id",campaign.products]}:{$eq:["$category.main",campaign.category]};
  const raw=campaign.discountType==="percent"?{$floor:{$add:[{$divide:[{$multiply:[base,10000-Math.round(campaign.value*100)]},10000]},.5]}}:campaign.discountType==="fixed"?{$subtract:[base,Math.round(campaign.value*100)]}:Math.round(campaign.value*100);
  candidates.push(candidate(raw,{$and:[retail,matches]}));
 }
 return {$divide:[{$min:candidates},100]};
}
