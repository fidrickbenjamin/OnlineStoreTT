import React,{useEffect,useRef,useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {useHubQuery} from '../../redux/api/hubApi';
import {Field,ErrorBox,useAction} from './HubUI';
const valid=p=>p&&p.lat!==''&&p.lng!==''&&p.lat!=null&&p.lng!=null&&Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lng));
export default function RouteMap({pickup,dropoff,onChange,geometry,driver,destinationOnly=false}){
 const {data}=useHubQuery('/config'),[act,state]=useAction(),node=useRef(null),map=useRef(null),markers=useRef([]),vehicle=useRef(null),line=useRef(null),latest=useRef(null),searchToken=useRef(0),[target,setTarget]=useState(destinationOnly?'dropoff':'pickup'),[query,setQuery]=useState(''),[results,setResults]=useState([]),[road,setRoad]=useState(null),[error,setError]=useState('');latest.current={pickup,dropoff,onChange,target};
 const pinKey=`${pickup?.lat},${pickup?.lng}|${dropoff?.lat},${dropoff?.lng}`;
 useEffect(()=>{setRoad(null);},[pinKey]);
 useEffect(()=>{
  if(!data?.mapsKey||!node.current)return;
  const m=L.map(node.current,{center:[15.46,-61.35],zoom:10,scrollWheelZoom:false,maxBounds:[[15,-61.8],[15.9,-61]],minZoom:8});map.current=m;
  const tiles=L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${encodeURIComponent(data.mapsKey)}`,{maxZoom:19,updateWhenIdle:true,keepBuffer:1,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://www.geoapify.com/">Powered by Geoapify</a>'}).addTo(m);
  tiles.on('tileerror',()=>setError('Map imagery is unavailable. Your selected pins and address fields can still be used.'));
  m.on('click',e=>{const v=latest.current;if(v.onChange)v.onChange(v.target,{...v[v.target],lat:e.latlng.lat,lng:e.latlng.lng});});
  const resize=new ResizeObserver(()=>m.invalidateSize());resize.observe(node.current);
  return()=>{resize.disconnect();m.remove();map.current=null;markers.current=[];vehicle.current=null;line.current=null;};
 },[data?.mapsKey]);
 useEffect(()=>{
  const m=map.current;if(!m)return;markers.current.forEach(marker=>marker.remove());markers.current=[];const bounds=[];
  for(const [p,key,label] of [[pickup,'pickup','P'],[dropoff,'dropoff','D']])if(valid(p)){
   const pos=[Number(p.lat),Number(p.lng)],tooltip=document.createElement('span');tooltip.textContent=`${key==='pickup'?'Pickup':'Destination'}: ${p.label||p.community||'Selected pin'}`;
   const marker=L.marker(pos,{icon:L.divIcon({className:`hub-map-pin ${key}`,html:label,iconSize:[32,32],iconAnchor:[16,32]}),draggable:Boolean(onChange)&&(!destinationOnly||key==='dropoff'),title:key==='pickup'?'Pickup pin':'Destination pin'}).addTo(m).bindTooltip(tooltip);marker.on('dragend',()=>{const v=latest.current,p=marker.getLatLng();v.onChange?.(key,{...v[key],lat:p.lat,lng:p.lng});});markers.current.push(marker);bounds.push(pos);
  }
  if(bounds.length===2)m.fitBounds(bounds,{padding:[30,30],maxZoom:15,animate:false});else if(bounds.length)m.setView(bounds[0],14,{animate:false});
 },[pickup,dropoff,onChange,data?.mapsKey,destinationOnly]);
 useEffect(()=>{const m=map.current;if(!m)return;if(!valid(driver)){vehicle.current?.remove();vehicle.current=null;return;}const pos=[Number(driver.lat),Number(driver.lng)];if(vehicle.current)vehicle.current.setLatLng(pos);else vehicle.current=L.marker(pos,{title:'Delivery vehicle',icon:L.divIcon({className:'hub-map-pin driver',html:'🚗',iconSize:[34,34],iconAnchor:[17,17]})}).addTo(m);},[driver,data?.mapsKey]);
 useEffect(()=>{const m=map.current;if(!m)return;line.current?.remove();line.current=null;const g=geometry||road?.geometry;if(g&&['LineString','MultiLineString'].includes(g.type))line.current=L.geoJSON(g,{style:{color:'#b57b13',weight:5,opacity:.85},interactive:false}).addTo(m);},[geometry,road,data?.mapsKey]);
 const locate=()=>{if(!navigator.geolocation){setError('Location is unavailable. Enter your address or map pin.');return;}navigator.geolocation.getCurrentPosition(p=>{const v=latest.current;if(p.coords.latitude<15.1||p.coords.latitude>15.7||p.coords.longitude< -61.6||p.coords.longitude> -61.2){setError('Your current location is outside Dominica. Choose the recipient location manually.');return;}v.onChange?.(v.target,{...v[v.target],lat:p.coords.latitude,lng:p.coords.longitude});setError('');},()=>setError('Location permission or signal unavailable. Choose the point manually.'),{enableHighAccuracy:true,timeout:12000});};
 return <section className="hub-map-card" aria-label="Route map"><div className="hub-map-top"><strong>Pickup & destination</strong>{onChange&&<div className="hub-actions">{!destinationOnly&&<button type="button" className="hub-btn light" aria-pressed={target==='pickup'} onClick={()=>{setTarget('pickup');setResults([]);searchToken.current++;}}>Pickup pin</button>}<button type="button" className="hub-btn light" aria-pressed={target==='dropoff'} onClick={()=>{setTarget('dropoff');setResults([]);searchToken.current++;}}>Destination pin</button><button type="button" className="hub-btn light" onClick={locate}>Use my location</button></div>}</div>
 {onChange&&data?.routingConfigured&&<div className="hub-map-search"><Field label={`Find ${target==='pickup'?'pickup':'destination'} in Dominica`} value={query} maxLength={160} onChange={e=>{setQuery(e.target.value);setResults([]);searchToken.current++;}}/><button type="button" className="hub-btn light" disabled={query.trim().length<3||state.isLoading} onClick={async()=>{const token=++searchToken.current,r=await act('/maps/search',{query});if(r&&token===searchToken.current){setResults(r.results);setError(r.results.length?'':'No matches. Choose a pin and enter a nearby landmark.');}}}>Search location</button>{results.length>0&&<ul>{results.map((r,i)=><li key={i}><button type="button" onClick={()=>{onChange(target,{...latest.current[target],lat:r.lat,lng:r.lng,label:r.label,community:r.community||latest.current[target]?.community});setResults([]);}}>{r.label}</button></li>)}</ul>}</div>}
 {data?.mapsKey?<div className="hub-map" ref={node}/>:<div className="hub-map-placeholder"><i className="bi bi-geo-alt" aria-hidden="true"/><strong>Your island. Your route.</strong><p>Enter communities and landmarks below. Interactive maps become available when the store configures its Geoapify browser key.</p></div>}
 <ErrorBox error={state.error||error}/>{onChange&&data?.mapsKey&&<small>Choose Pickup or Destination, then tap the map or drag its pin. Keep the address and community accurate.</small>}
 {data?.routingConfigured&&valid(pickup)&&valid(dropoff)&&<button type="button" className="hub-btn light" disabled={state.isLoading} onClick={async()=>{const key=pinKey,r=await act('/maps/route',{pickup:{lat:pickup.lat,lng:pickup.lng},dropoff:{lat:dropoff.lat,lng:dropoff.lng}});const v=latest.current;if(r&&key===`${v.pickup?.lat},${v.pickup?.lng}|${v.dropoff?.lat},${v.dropoff?.lng}`)setRoad(r.route);}}>Show road route</button>}
 {road&&<p className="hub-note">Road estimate: {road.distanceKm.toFixed(1)} km · about {Math.ceil(road.durationMinutes)} minutes. This does not change an agreed delivery fee.</p>}
 </section>;
}
