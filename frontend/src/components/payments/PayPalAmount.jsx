import React from 'react';
export default function PayPalAmount({xcd}){
 const cents=Math.round(Number(xcd)*100),usd=Math.round(cents*10/27)/100;
 if(!Number.isFinite(usd))return null;
 return <p className="tt-payment-note" role="note">Order total: <strong>XCD {(cents/100).toFixed(2)}</strong><br/>PayPal payment: <strong>USD {usd.toFixed(2)}</strong><br/><small>Converted at XCD 2.70 per USD 1 and rounded to the nearest USD cent. Your bank or PayPal may apply additional fees.</small></p>;
}
