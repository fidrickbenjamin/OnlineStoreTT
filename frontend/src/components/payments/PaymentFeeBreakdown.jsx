import React from 'react';
import {useHubQuery} from '../../redux/api/hubApi';
const money=n=>new Intl.NumberFormat('en-DM',{style:'currency',currency:'XCD'}).format(n/100);
export default function PaymentFeeBreakdown({amountCents,method='ShopdmPay',summary,showBase=true}){
 const valid=Number.isSafeInteger(amountCents)&&amountCents>=0,{currentData,error,isFetching}=useHubQuery(`/fees/preview?amountCents=${amountCents||0}&method=${encodeURIComponent(method)}`,{skip:Boolean(summary)||!valid}),fees=summary||currentData?.fees;
 if(!summary&&!valid)return null;
 if(!fees)return <p role="status">{error?'Fee estimate unavailable. Check the payment provider’s final breakdown before confirming.':isFetching?'Checking payment fees…':''}</p>;
 if(!fees.customerFeeCents&&fees.method!=='ShopdmPay')return null;
 return <section aria-label="Payment fee breakdown" style={{border:'1px solid #dbe3da',borderRadius:10,padding:'1rem',margin:'1rem 0',background:'#f8faf5',overflowWrap:'anywhere'}}><strong>{fees.method==='ShopdmPay'?'ShopDM payment breakdown':'Payment breakdown'}</strong>{showBase&&<p style={{display:'flex',justifyContent:'space-between',gap:12,margin:'.5rem 0'}}><span>Order total, including delivery and applicable tax</span><span>{money(fees.baseCents)}</span></p>}<p style={{display:'flex',justifyContent:'space-between',gap:12,margin:'.5rem 0'}}><span>Customer processing fee</span><span>{money(fees.customerFeeCents)}</span></p><p style={{display:'flex',justifyContent:'space-between',gap:12,margin:'.5rem 0'}}><strong>Estimated total at {fees.method==='ShopdmPay'?'ShopDM':'provider'}</strong><strong>{money(fees.customerTotalCents)}</strong></p><small>{fees.providerAddsCustomerFee?'The payment provider adds this customer fee once. Tactical Trends sends the order total without adding the fee again.':'No ShopDM fee applies to this method.'} The provider’s receipt confirms the actual amount paid.</small></section>;
}
