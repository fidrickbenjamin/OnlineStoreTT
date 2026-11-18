import React,{useState} from 'react';
import ItemPhotoEditor from './ItemPhotoEditor';
import {Field,ErrorBox,useAction} from './HubUI';
import './businessBanner.css';
export function BusinessCardVisual({business:b,children}){
 const [failed,setFailed]=useState(false),open=b.isOpen??b.acceptingOrders;
 const label=!b.acceptingOrders?'Orders paused':b.schedule?.enabled?(open?'Open now':'Closed'):'Hours unavailable';
 return <div className="hub-business-visual">{b.cardBanner&&!failed?<img className="hub-business-banner" src={b.cardBanner} alt={`${b.name} storefront`} loading="lazy" decoding="async" width="960" height="600" style={{objectPosition:`center ${b.bannerPosition||'center'}`}} onError={()=>setFailed(true)}/>:children}<span className={`hub-business-badge ${!b.acceptingOrders?'paused':b.schedule?.enabled?(open?'open':'closed'):'unknown'}`}><span aria-hidden="true"/>{label}</span></div>;
}
export function BusinessBannerEditor({value,position='center',onChange,onPosition,partner=false,onBusyChange}){
 return <section className="hub-business-banner-editor"><ItemPhotoEditor label="Card banner" saveTarget="business" value={value} onChange={onChange} partner={partner} onBusyChange={onBusyChange}/><p className="hub-note">Optional: use a wide photo (recommended 1600 × 1000). Leave blank to show the shop illustration. Your logo stays separate. Save the business after uploading or removing a banner.</p><Field label="Banner image position"><select value={position||'center'} onChange={e=>onPosition(e.target.value)}><option value="top">Top</option><option value="center">Centre</option><option value="bottom">Bottom</option></select></Field>{value&&<div className="hub-business-banner-preview"><img src={value} alt="Card banner crop preview" style={{objectPosition:`center ${position||'center'}`}}/><span className="hub-business-badge open"><span aria-hidden="true"/>Status stays visible here</span></div>}{value&&<button className="hub-btn light" type="button" onClick={()=>onChange('')}>Use default shop illustration</button>}</section>;
}
export function PartnerBanner({business:b}){
 const [value,setValue]=useState(b.cardBanner||''),[position,setPosition]=useState(b.bannerPosition||'center'),[busy,setBusy]=useState(false),[saved,setSaved]=useState(false),[act,state]=useAction();
 return <form className="hub-panel" onSubmit={async e=>{e.preventDefault();if(busy)return;const r=await act('/business',{revision:b.revision,hours:b.hours,acceptingOrders:b.acceptingOrders,cardBanner:value,bannerPosition:position},'PUT');if(r)setSaved(true);}}><h3>Business card appearance</h3><fieldset disabled={busy||state.isLoading} style={{border:0,padding:0,minWidth:0}}><BusinessBannerEditor value={value} position={position} onChange={v=>{setValue(v);setSaved(false);}} onPosition={setPosition} partner onBusyChange={setBusy}/><ErrorBox error={state.error}/><button className="hub-btn">Save business banner</button></fieldset>{saved&&<p role="status">Business banner saved.</p>}</form>;
}
