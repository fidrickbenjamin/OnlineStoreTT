export const cents = value => Math.round((Number(value) + Number.EPSILON)*100);
export const retail = product => product.listingType!=="property" && product.category?.main!=="Property or Real Estate";
export function campaignState(campaign, now = new Date()) {
 if(campaign.status!=="enabled")return campaign.status;
 if(+new Date(campaign.endsAt)<=+now)return "ended";
 return +new Date(campaign.startsAt)>+now ? "scheduled" : "active";
}
export function applies(campaign,product) {
 return campaign.scope==="products" ? campaign.products.some(id=>String(id)===String(product._id)) : campaign.category===product.category?.main;
}
export function discountedCents(regular,type,value) {
 const result = type==="percent" ? Math.round(regular*(10000-Math.round(Number(value)*100))/10000) : type==="fixed" ? regular-cents(value) : cents(value);
 // Zero-cost online orders are not supported by the existing payment gateways.
 return Number.isFinite(result)&&result>0&&result<regular ? result : regular;
}
export function priceProduct(product,campaigns=[],now=new Date()) {
 const data=product.toObject?product.toObject():{...product};const regular=cents(data.price);let best={amount:regular,id:""};
 if(retail(data)){
  const sale=data.directSale;
  if(sale?.enabled&&(!sale.startsAt||+new Date(sale.startsAt)<=+now)&&(!sale.endsAt||+new Date(sale.endsAt)>+now)){
   const amount=discountedCents(regular,"price",sale.price);
   if(amount<best.amount)best={amount,id:`direct:${data._id}`,label:sale.label||"Sale",endsAt:sale.endsAt||null};
  }
  for(const campaign of campaigns){
   if(campaignState(campaign,now)!=="active"||!applies(campaign,data))continue;
   const amount=discountedCents(regular,campaign.discountType,campaign.value);
   if(amount<best.amount||(amount===best.amount&&amount<regular&&String(campaign._id)<best.id))best={amount,id:String(campaign._id),campaignId:String(campaign._id),label:campaign.label||campaign.name,endsAt:campaign.endsAt};
  }
 }
 delete data.directSale;data.regularPrice=regular/100;data.price=best.amount/100;
 data.savings=(regular-best.amount)/100;data.discountPercent=regular?Math.round((regular-best.amount)*100/regular):0;
 data.promotion=best.amount<regular?{id:best.id,campaignId:best.campaignId,label:best.label,endsAt:best.endsAt}:null;
 return data;
}
export function validateCampaign(body,categories=[]) {
 const name=String(body.name||"").trim(),label=String(body.label||"Sale").trim(),bannerText=String(body.bannerText||"").trim();
 if(!name||name.length>100||!label||label.length>40||bannerText.length>200)throw Error("Enter a name (100 characters), badge (40) and banner (200) within their limits.");
 const discountType=body.discountType,value=Number(body.value),scope=body.scope,status=body.status||"draft";
 if(!["percent","fixed","price"].includes(discountType)||!Number.isFinite(value)||value<.01||value>99999.99||Math.abs(value*100-Math.round(value*100))>1e-7||(discountType==="percent"&&value>=100))throw Error("Discount must be positive with at most two decimals; percentages must be below 100.");
 if(!["products","category"].includes(scope)||!["draft","enabled","paused","ended"].includes(status))throw Error("Choose a valid scope and status.");
 const products=Array.isArray(body.products)?[...new Set(body.products.map(String))]:[];
 const category=String(body.category||"");
 if(scope==="products"&&(!products.length||products.length>500||products.some(id=>!/^[a-f\d]{24}$/i.test(id))))throw Error("Select between 1 and 500 valid products.");
 if(scope==="category"&&!categories.includes(category))throw Error("Choose a supported retail category.");
 const startsAt=new Date(body.startsAt),endsAt=new Date(body.endsAt);
 if(!Number.isFinite(+startsAt)||!Number.isFinite(+endsAt)||endsAt<=startsAt)throw Error("Choose valid dates with the end after the start.");
 return {name,label,bannerText,discountType,value,scope,products:scope==="products"?products:[],category:scope==="category"?category:"",startsAt,endsAt,status};
}
export function validateDirectSale(body,regularPrice) {
 if(!body.enabled)return {enabled:false};
 const price=Number(body.price),label=String(body.label||"Sale").trim();
 if(!Number.isFinite(price)||price<.01||cents(price)>=cents(regularPrice)||Math.abs(price*100-Math.round(price*100))>1e-7)throw Error("Sale price must be at least XCD 0.01, below the regular price, with at most two decimals.");
 const startsAt=body.startsAt?new Date(body.startsAt):null,endsAt=body.endsAt?new Date(body.endsAt):null;
 if((startsAt&&!Number.isFinite(+startsAt))||(endsAt&&!Number.isFinite(+endsAt))||(startsAt&&endsAt&&endsAt<=startsAt)||!label||label.length>40)throw Error("Check the sale dates and badge text.");
 return {enabled:true,price,label,startsAt,endsAt};
}
