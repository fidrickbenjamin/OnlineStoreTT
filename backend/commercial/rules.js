import {fail,cents} from '../hubs/rules.js';
export const optionalCost=value=>value===undefined||value===null||String(value).trim()===''?undefined:cents(value);
export function costSnapshot(cost,variantId,extraIds=[]){
 const base=variantId?cost?.variants?.find(v=>v.id===variantId)?.costCents:cost?.costCents;
 const extras=extraIds.map(id=>cost?.extras?.find(v=>v.id===String(id))?.costCents);
 const known=Number.isSafeInteger(base)&&extras.every(Number.isSafeInteger);
 return {costKnown:known,purchaseUnitCents:known?base+extras.reduce((s,v)=>s+v,0):undefined,inventory:cost?.inventory||'procure',supplier:cost?.business,costRevision:cost?.revision};
}
export function itemFinancials(items){const known=items.every(i=>i.costKnown===true&&Number.isSafeInteger(i.purchaseUnitCents));return {costKnown:known,purchaseCents:known?items.reduce((s,i)=>s+i.purchaseUnitCents*i.quantity,0):undefined,supplierDueCents:known?items.reduce((s,i)=>s+(i.inventory==='prepaid'?0:i.purchaseUnitCents*i.quantity),0):undefined};}
export function monthAfter(date,anchorDay){const d=new Date(date),day=anchorDay||d.getUTCDate(),year=d.getUTCFullYear(),month=d.getUTCMonth()+1,last=new Date(Date.UTC(year,month+1,0)).getUTCDate();return new Date(Date.UTC(year,month,Math.min(day,last),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds(),d.getUTCMilliseconds()));}
export function dueDate(date,terms){const d=new Date(date);if(!terms||terms.frequency==='immediate')return d;if(terms.frequency==='monthly'){const local=new Date(+d-4*3600000);return new Date(Date.UTC(local.getUTCFullYear(),local.getUTCMonth()+1,1,4));}if(!terms.anchor)fail('Fortnightly terms need an agreed anchor date.');const start=+new Date(terms.anchor),period=14*86400000;return new Date(start+Math.max(1,Math.floor((+d-start)/period)+1)*period);}
export function contribution(job){const f=itemFinancials(job.items||[]),delivery=job.quote?.feeCents,driver=job.fulfilment==='collection'?0:job.quote?.driverCents;return {...f,grossProfitCents:f.costKnown?(job.itemsCents||0)-f.purchaseCents:null,deliveryMarginCents:Number.isSafeInteger(delivery)&&Number.isSafeInteger(driver)?delivery-driver:null,contributionCents:f.costKnown&&Number.isSafeInteger(delivery)&&Number.isSafeInteger(driver)?(job.itemsCents||0)-f.purchaseCents+delivery-driver:null};}
