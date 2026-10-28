import {coordinate,text,fail} from './rules.js';
const cache=new Map(),pending=new Map();let day='',used=0,cooldown=0;
async function provider(path,params,ttl){
 const key=process.env.HUB_GEOAPIFY_SERVER_KEY;if(!key)fail('Address search and road routing are not configured. Use map pins or landmarks.',503);
 const url=new URL(`https://api.geoapify.com/v1/${path}`);for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);url.searchParams.set('apiKey',key);
 const id=url.href,hit=cache.get(id);if(hit&&hit.until>Date.now())return hit.value;if(pending.has(id))return pending.get(id);
 const today=new Date().toISOString().slice(0,10);if(day!==today){day=today;used=0;}const cap=Math.max(1,Math.min(10000,Number(process.env.HUB_MAP_REQUESTS_PER_DAY)||500));if(used>=cap||Date.now()<cooldown)fail('Map service allowance unavailable. Use communities and landmarks; a quote can still be requested.',503);
 used++;
 const request=(async()=>{try{const r=await fetch(url,{signal:AbortSignal.timeout(9000)});if(!r.ok){if([401,403,429].includes(r.status))cooldown=Date.now()+60000;fail('Map provider unavailable. Please use pins or landmarks.',503);}const value=await r.json();if(cache.size>=250)cache.delete(cache.keys().next().value);cache.set(id,{value,until:Date.now()+ttl});return value;}catch(e){if(e.statusCode)throw e;fail('Map service did not respond. Use communities and landmarks.',503);}finally{pending.delete(id);}})();pending.set(id,request);return request;
}
export async function roadRoute(from,to){
 const a=coordinate(from?.lat,from?.lng),b=coordinate(to?.lat,to?.lng);
 const json=await provider('routing',{waypoints:`${a.lat.toFixed(5)},${a.lng.toFixed(5)}|${b.lat.toFixed(5)},${b.lng.toFixed(5)}`,mode:'drive',format:'geojson'},15*60000);
 const f=json.features?.[0],p=f?.properties,g=f?.geometry;
 if(!Number.isFinite(p?.distance)||p.distance<0||p.distance>1000000||!Number.isFinite(p.time)||p.time<0||!['LineString','MultiLineString'].includes(g?.type))fail('No usable road route found. Request a manual quote.',503);
 const lines=g.type==='LineString'?[g.coordinates]:g.coordinates;if(!Array.isArray(lines)||!lines.length||lines.reduce((s,l)=>s+(Array.isArray(l)?l.length:1e9),0)>20000||lines.some(l=>!Array.isArray(l)||l.some(c=>!Array.isArray(c)||!Number.isFinite(c[0])||!Number.isFinite(c[1])||c[0]<-61.7||c[0]>-61.1||c[1]<15||c[1]>15.8)))fail('Route outside the supported area. Request a manual quote.',503);
 return {distanceKm:p.distance/1000,durationMinutes:p.time/60,geometry:{type:g.type,coordinates:g.coordinates}};
}
export async function geocode(req,res){
 const query=text(req.body.query,160);if(query.length<3)fail('Enter at least three characters.');
 const result=await provider('geocode/search',{text:query,filter:'countrycode:dm',format:'json',limit:'5'},24*3600000);
 const results=(result.results||[]).flatMap(row=>{try{const p=coordinate(row.lat,row.lon);return [{...p,label:text(row.formatted,180),community:text(row.city||row.town||row.village||row.suburb,80)}];}catch{return [];}});
 res.set('Cache-Control','private, no-store').json({results});
}
export async function routePreview(req,res){try{res.set('Cache-Control','private, no-store').json({route:await roadRoute(req.body.pickup,req.body.dropoff)});}catch(e){res.status(e.statusCode||503).json({message:e.message||'Road route unavailable.'});}}
