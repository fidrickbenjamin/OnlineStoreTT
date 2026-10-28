import {roadRoute} from './maps.js';
import {communityRate} from './deliveryAreas.js';
import {Settings} from './models.js';
import {point} from './rules.js';
export async function settings(){return await Settings.findById('hubs').lean()||{revision:0,rideBaseCents:1000,rideKmCents:250,deliveryBaseCents:800,deliveryKmCents:180,foodCommissionPercent:0,zones:[],instructions:'Quotes are subject to availability. All amounts are XCD.'};}
export async function estimate(kind,from,to){
 const pickup=point(from),dropoff=point(to),s=await settings();
 const zone=communityRate(s,kind,pickup.community,dropoff.community);
 if(zone)return zone;
 let road=null;
 if(process.env.HUB_GEOAPIFY_SERVER_KEY&&pickup.lat!==undefined&&dropoff.lat!==undefined){try{road=await roadRoute(pickup,dropoff);}catch{/* Keep manual quotation available. */}}
 const fee=road?Math.round((kind==='ride'?s.rideBaseCents:s.deliveryBaseCents)+road.distanceKm*(kind==='ride'?s.rideKmCents:s.deliveryKmCents)):null;
 return {feeCents:fee??null,source:road?'Road-distance estimate':'Manual quotation required',...road};
}
