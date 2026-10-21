import React, { useEffect, useState } from "react";
import Price from "../Price/Price";
import "./promotions.css";
export function Countdown({ endsAt }) {
 const [now,setNow]=useState(Date.now());useEffect(()=>{if(!endsAt)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[endsAt]);
 if(!endsAt)return null;const seconds=Math.max(0,Math.floor((new Date(endsAt)-now)/1000));
 if(!seconds)return <small className="tt-sale-countdown">Offer ended — refresh prices</small>;
 const days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60);
 return <small className="tt-sale-countdown">Ends in {days?`${days}d `:""}{hours}h {minutes}m {seconds%60}s</small>;
}
export default function SalePrice({product,size}){
 const [now,setNow]=useState(Date.now());useEffect(()=>{if(!product.promotion?.endsAt)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[product.promotion?.endsAt]);
 const sale=product.promotion&&Number(product.regularPrice)>Number(product.price),expired=sale&&product.promotion.endsAt&&+new Date(product.promotion.endsAt)<=now;
 return <span className="tt-sale-price">{sale&&!expired&&<><span className="tt-sale-badge">{product.promotion.label}</span><span className="tt-was-price">XCD {Number(product.regularPrice).toFixed(2)}</span></>}<Price amount={expired?product.regularPrice:product.price} size={size}/>{sale&&!expired&&<span className="tt-saving">Save XCD {Number(product.savings).toFixed(2)}{product.discountPercent>0?` (${product.discountPercent}% off)`:""}</span>}{sale&&<Countdown endsAt={product.promotion.endsAt}/>}</span>;
}
