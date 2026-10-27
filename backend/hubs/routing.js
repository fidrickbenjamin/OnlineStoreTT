import {communityRate} from './deliveryAreas.js';
import {Settings} from './models.js';
import {point} from './rules.js';
export async function settings(){return await Settings.findById('hubs').lean()||{revision:0,rideBaseCents:1000,rideKmCents:250,deliveryBaseCents:800,deliveryKmCents:180,foodCommissionPercent:0,zones:[],instructions:'Quotes are subject to availability. All amounts are XCD.'};}
export async function estimate(kind,from,to){
 const pickup=point(from),dropoff=point(to),s=await settings();
 const zone=communityRate(s,kind,pickup.community,dropoff.community);
 if(zone)return zone;
 let road=null;
 if(process.env.HUB_GOOGLE_ROUTES_KEY&&pickup.lat!==undefined&&dropoff.lat!==undefined){
  try{const response=await fetch('https://routes.googleapis.com/directions/v2:computeRoutes',{method:'POST',signal:AbortSignal.timeout(9000),headers:{'Content-Type':'application/json','X-Goog-Api-Key':process.env.HUB_GOOGLE_ROUTES_KEY,'X-Goog-FieldMask':'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline'},body:JSON.stringify({origin:{location:{latLng:{latitude:pickup.lat,longitude:pickup.lng}}},destination:{location:{latLng:{latitude:dropoff.lat,longitude:dropoff.lng}}},travelMode:'DRIVE'})});if(response.ok){const r=(await response.json()).routes?.[0];if(r&&Number.isFinite(r.distanceMeters))road={distanceKm:r.distanceMeters/1000,durationMinutes:parseFloat(r.duration)/60,polyline:r.polyline?.encodedPolyline};}}catch{/* A quotation remains possible when the routing service is unavailable. */}
 }
 const fee=road?Math.round((kind==='ride'?s.rideBaseCents:s.deliveryBaseCents)+road.distanceKm*(kind==='ride'?s.rideKmCents:s.deliveryKmCents)):null;
 return {feeCents:fee??null,source:road?'Road-distance estimate':'Manual quotation required',...road};
}
