// Integer cents and basis points only. Customer provider fees are not merchant revenue.
const inputError=message=>Object.assign(new Error(message),{statusCode:400});
export const DEFAULT_PROFILES={
 ShopdmPay:{method:'ShopdmPay',version:'confirmed-shopdm-v1',customerBps:300,merchantBps:300,customerFixedCents:0,merchantFixedCents:0,merchantKnown:true,providerAddsCustomerFee:true,rounding:'half-up',reference:'Business-confirmed: both 3% fees apply to the order total including delivery.'},
 CASH:{method:'CASH',version:'cash-v1',customerBps:0,merchantBps:0,customerFixedCents:0,merchantFixedCents:0,merchantKnown:true,providerAddsCustomerFee:false,rounding:'half-up'},
 NBD:{method:'NBD',version:'bank-v1',customerBps:0,merchantBps:0,customerFixedCents:0,merchantFixedCents:0,merchantKnown:true,providerAddsCustomerFee:false,rounding:'half-up'},
 PayPal:{method:'PayPal',version:'paypal-unconfigured',customerBps:0,merchantBps:0,customerFixedCents:0,merchantFixedCents:0,merchantKnown:false,providerAddsCustomerFee:true,rounding:'half-up'}
};
export function safeInt(n,label='Amount',max=1000000000){if(!Number.isSafeInteger(n)||n<0||n>max)throw inputError(`${label} must be a nonnegative whole amount within the supported limit.`);return n;}
export function percentBps(input,optional=false,max=100000){if(optional&&(input==null||String(input).trim()===''))return null;const s=String(input??'').trim();if(!/^\d+(\.\d{1,2})?$/.test(s))throw inputError('Enter a nonnegative percentage with at most two decimal places.');const n=Math.round(Number(s)*100);return safeInt(n,'Percentage',max);}
export function moneyCents(input,optional=false){if(optional&&(input==null||String(input).trim()===''))return null;const s=String(input??'').trim();if(!/^\d+(\.\d{1,2})?$/.test(s))throw inputError('Enter an XCD amount with at most two decimal places.');return safeInt(Math.round(Number(s)*100));}
export function percentageFee(base,bps,rounding='half-up'){safeInt(base);safeInt(bps,'Fee rate',10000);const raw=base*bps/10000;return rounding==='ceil'?Math.ceil(raw):rounding==='floor'?Math.floor(raw):Math.floor(raw+.5);}
export function feeSnapshot(baseCents,profile){safeInt(baseCents);const customerFeeCents=percentageFee(baseCents,profile.customerBps,profile.rounding)+profile.customerFixedCents,merchantFeeCents=profile.merchantKnown?percentageFee(baseCents,profile.merchantBps,profile.rounding)+profile.merchantFixedCents:null;return {version:1,method:profile.method,profileVersion:profile.version,baseCents,feeBase:'full-order',customerFeeCents,customerTotalCents:baseCents+customerFeeCents,merchantFeeCents,estimatedReceiptsCents:merchantFeeCents==null?null:baseCents-merchantFeeCents,providerAddsCustomerFee:profile.providerAddsCustomerFee,merchantKnown:profile.merchantKnown,profile:{...profile},quotedAt:new Date()};}
export function publicFees(snapshot){if(!snapshot)return null;const {method,profileVersion,baseCents,customerFeeCents,customerTotalCents,providerAddsCustomerFee}=snapshot;return {method,profileVersion,baseCents,customerFeeCents,customerTotalCents,providerAddsCustomerFee,estimate:true};}
export function suggestedPrice(costCents,basis,targetBps,profile,fixedAllocationCents=null){
 if(!Number.isSafeInteger(costCents)||costCents<0||targetBps==null)return null;safeInt(targetBps,'Target percentage',100000);
 if(basis==='markup')return Math.ceil(costCents*(10000+targetBps)/10000);
 if(basis!=='margin')throw inputError('Choose markup on cost or contribution margin on selling price.');
 if(!profile.merchantKnown)return null;
 if(profile.merchantFixedCents>0&&fixedAllocationCents==null)return null;
 const taxBps=profile.pricingTaxBps||0;const denominator=100000000-profile.merchantBps*(10000+taxBps)-targetBps*10000;if(denominator<=0)throw inputError('Target margin plus merchant percentage must be below 100%.');
 const allocation=fixedAllocationCents??0;safeInt(allocation);let price=Math.ceil((costCents+allocation)*100000000/denominator);
 // Check the target after the provider's cent rounding; rounding the formula alone can miss it.
 for(let n=0;n<10000;n++,price++){safeInt(price);const feeBase=price+percentageFee(price,taxBps);const fee=percentageFee(feeBase,profile.merchantBps,profile.rounding)+allocation;if((price-fee-costCents)*10000>=price*targetBps)return price;}
 throw inputError('A suggested price could not be calculated within the supported rounding range.');
}
export function unitPreview(priceCents,costCents,profile){const known=Number.isSafeInteger(costCents);const percentage=profile.merchantKnown?percentageFee(priceCents+percentageFee(priceCents,profile.pricingTaxBps||0),profile.merchantBps,profile.rounding):null;const contributionCents=known&&percentage!=null?priceCents-costCents-percentage:null;return {sellingCents:priceCents,purchaseCents:known?costCents:null,merchantPercentageCents:percentage,contributionCents,contributionMarginPercent:contributionCents!=null&&priceCents>0?Number((contributionCents/priceCents*100).toFixed(2)):null,markupPercent:known&&costCents>0?Number(((priceCents-costCents)/costCents*100).toFixed(2)):null,fixedOrderFeeExcluded:profile.merchantFixedCents>0};}
