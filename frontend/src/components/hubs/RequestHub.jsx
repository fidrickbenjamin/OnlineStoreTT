import React,{useEffect,useRef,useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {useHubQuery} from '../../redux/api/hubApi';
import {PaymentOptions} from './HubPayments';
import RouteMap from './RouteMap';
import {HubShell,Field,PointFields,ErrorBox,money,useAction,blankPoint} from './HubUI';
export default function RequestHub({kind}){return <BookingForm key={kind} kind={kind}/>;}
function BookingForm({kind}){
 const ride=kind==='ride',navigate=useNavigate(),{user}=useSelector(s=>s.auth),{data:config}=useHubQuery('/config');
 const [pickup,setPickup]=useState(()=>({...blankPoint(),contact:user?.name||'',phone:user?.contactPhone||''})),[dropoff,setDropoff]=useState(()=>({...blankPoint(),...(ride?{contact:user?.name||'',phone:user?.contactPhone||''}:{})}));
 const [details,setDetails]=useState(''),[passengers,setPassengers]=useState(1),[when,setWhen]=useState(''),[method,setMethod]=useState('CASH'),[result,setResult]=useState(null),[activePoint,setActivePoint]=useState('pickup'),[localError,setLocalError]=useState(''),[pending,setPending]=useState(''),[act,state]=useAction();
 const key=useRef(crypto.randomUUID()),mapCard=useRef(null),locations=useRef(null),errorBox=useRef(null),latest=useRef(null),estimateSequence=useRef(0);
 const routeKey=JSON.stringify({kind,pickup,dropoff});latest.current=routeKey;
 useEffect(()=>{setPickup(p=>({...p,contact:p.contact||user?.name||'',phone:p.phone||user?.contactPhone||''}));if(ride)setDropoff(p=>({...p,contact:p.contact||user?.name||'',phone:p.phone||user?.contactPhone||''}));},[user?.name,user?.contactPhone,ride]);
 const change=(which,value)=>{(which==='pickup'?setPickup:setDropoff)(value);setResult(null);setLocalError('');estimateSequence.current++;};
 const chooseOnMap=which=>{setActivePoint(which);requestAnimationFrame(()=>mapCard.current?.querySelector('[aria-pressed=true]')?.focus({preventScroll:true}));mapCard.current?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 const estimate=async()=>{
  if(!user){navigate('/login');return;}
  const invalid=[...locations.current.querySelectorAll('input,select,textarea')].find(el=>!el.checkValidity());
  if(invalid){setLocalError('Complete the pickup and destination contact details to calculate an estimate.');invalid.focus();invalid.reportValidity();return;}
  setPending('estimate');const snapshot=latest.current,sequence=++estimateSequence.current,r=await act('/estimate',{kind,pickup,dropoff});setPending('');
  if(r&&snapshot===latest.current&&sequence===estimateSequence.current){setResult(r.estimate);setLocalError('');}
 };
 const submit=async e=>{
  e.preventDefault();if(!user){navigate('/login');return;}if(state.isLoading)return;
  if(when&&!Number.isFinite(+new Date(when))){setLocalError('Choose a valid requested date and time.');return;}
  setPending('submit');const r=await act('/jobs',{kind,pickup,dropoff,details,passengers,paymentMethod:method,scheduledAt:when?new Date(when).toISOString():undefined,requestKey:key.current});setPending('');if(r)navigate(`/me/activity/${r.job._id}`);else errorBox.current?.scrollIntoView({block:'center'});
 };
 return <HubShell title={ride?'Your island. Your next ride.':'From your doorstep to theirs.'}><div className={`hub-booking-page ${ride?'is-ride':'is-delivery'}`}>
  <section className="hub-booking-intro"><span className="hub-booking-intro-icon" aria-hidden="true"><i className={`bi bi-${ride?'taxi-front':'truck'}`}/></span><div><span className="hub-eyebrow">{ride?'Ride Hub':'Delivery Hub'}</span><h2>{ride?'Where are we taking you?':'What are we moving today?'}</h2><p>{ride?'Choose your pickup and destination. We’ll confirm the fare and driver before you travel.':'Add pickup and recipient details. We’ll confirm the delivery cost before the job goes ahead.'}</p></div></section>
  <form onSubmit={submit} className="hub-booking-layout" aria-busy={state.isLoading}><section className="hub-booking-route"><div className="hub-booking-section-heading"><span className="hub-booking-step" aria-hidden="true">1</span><div><h2>Your locations</h2><p>{ride?'Where should the driver meet you, and where are you going?':'Where are we collecting from, and who is receiving the delivery?'}</p></div></div>
   <div className="hub-booking-locations" ref={locations}><PointFields title="Pickup" badge="P" compact autoCompletePrefix="section-pickup" value={pickup} onChange={v=>change('pickup',v)} onChooseMap={()=>chooseOnMap('pickup')}/><PointFields title="Destination" badge="D" compact autoCompletePrefix="section-destination" value={dropoff} onChange={v=>change('dropoff',v)} onChooseMap={()=>chooseOnMap('dropoff')}/></div>
   <div ref={mapCard} className="hub-booking-map-anchor"><RouteMap pickup={pickup} dropoff={dropoff} onChange={change} geometry={result?.geometry} activePoint={activePoint} onTargetChange={setActivePoint}/></div>
  </section>
  <aside className="hub-panel hub-booking-plan"><div className="hub-booking-section-heading"><span className="hub-booking-step" aria-hidden="true">2</span><div><h2>{ride?'Trip details':'Delivery details'}</h2><p>Review your request and payment arrangement.</p></div></div><div className="hub-booking-route-summary"><div><span className="hub-location-badge" aria-hidden="true">P</span><span><small>Pickup</small><strong>{pickup.community||'Choose pickup community'}</strong></span></div><div><span className="hub-location-badge destination" aria-hidden="true">D</span><span><small>Destination</small><strong>{dropoff.community||'Choose destination community'}</strong></span></div></div>
   {ride&&<Field label="Passengers" type="number" required min="1" max="12" value={passengers} onChange={e=>setPassengers(e.target.value)}/>}
   <Field label="Requested time (optional)" type="datetime-local" value={when} onChange={e=>setWhen(e.target.value)}/><p className="hub-booking-field-help">Leave blank for the next available service. Scheduled times use your device’s time zone.</p>
   <Field label={ride?'Luggage / stops / vehicle needs':'Package details / handling / who pays / goods already paid?'}><textarea required={!ride} maxLength={1000} value={details} onChange={e=>setDetails(e.target.value)} rows={3} placeholder={ride?'Optional: extra luggage, stops or accessibility needs':'Describe the items and any collection instructions'}/></Field>
   <PaymentOptions value={method} onChange={e=>setMethod(e.target.value)}/><button type="button" className="hub-btn light hub-booking-estimate-button" disabled={state.isLoading} onClick={estimate}>{pending==='estimate'?'Calculating…':'Calculate estimate'}</button>
   {result&&<div className="hub-quote hub-booking-estimate" role="status"><small>Estimated {ride?'fare':'delivery cost'}</small><strong>{result.feeCents===null?'Store quotation needed':money(result.feeCents)}</strong><p>{result.source}{result.distanceKm!==undefined?` · ${result.distanceKm.toFixed(1)} km · about ${Math.ceil(result.durationMinutes)} min`:''}</p></div>}
   <p className="hub-note">{config?.settings?.instructions||'Final quote and availability require confirmation.'} An estimate does not reserve a driver. Changes or extra stops need an agreed quote.</p><div ref={errorBox}><ErrorBox error={localError||state.error}/></div><button type={user?'submit':'button'} onClick={user?undefined:()=>navigate('/login')} className="hub-btn hub-booking-submit" disabled={state.isLoading}>{pending==='submit'?'Submitting…':user?`Request ${ride?'ride':'delivery'}`:'Sign in to request'}</button><p className="hub-booking-field-help">Review and accept the final quote before online payment. Submitting a request does not charge you.</p>
  </aside></form><div className="hub-booking-partner-link"><Link to="/driver-centre">Interested in driving with Tactical Trends? Apply here <span aria-hidden="true">↗</span></Link></div>
 </div></HubShell>;
}
