import {cents,text,fail} from './rules.js';
import {foodDeliveryEstimate} from './deliveryAreas.js';
export const BUSINESS_TYPES=['Restaurant','Bar','Restaurant & Bar','Convenience Store','Hardware Store'];
export const isPurchase=kind=>['food','convenience','hardware'].includes(kind);
export const businessKind=b=>b.type==='Convenience Store'?'convenience':b.type==='Hardware Store'?'hardware':'food';
export function storeItemFields(v,b){
 if(businessKind(b)==='food')return {};
 const deliveryClass=v.deliveryClass||'standard';if(!['standard','large','quote'].includes(deliveryClass))fail('Choose a valid delivery class.');
 if(v.options?.length)fail('Store products use purchase units, not meal extras.');
 const unit=text(v.unit,40)||'each';
 return {unit,deliveryClass,handlingCents:deliveryClass==='large'?cents(v.handlingFee??0):0};
}
export function basketDelivery(b,community,s,items,kind){
 const e=foodDeliveryEstimate(b,community,s,kind);if(kind==='food')return e;
 const handlingCents=items.reduce((sum,i)=>sum+(i.handlingCents||0)*i.quantity,0),quoteRequired=items.some(i=>i.deliveryClass==='quote');
 return {...e,handlingCents,quoteRequired,feeCents:quoteRequired||e.feeCents==null?null:e.feeCents+handlingCents,source:quoteRequired?'Vehicle and delivery quote required':e.source};
}
