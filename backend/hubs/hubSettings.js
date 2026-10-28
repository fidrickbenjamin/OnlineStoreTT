import {Settings} from './models.js';
import {integer,text,fail} from './rules.js';
export const HUBS=[['property','Property Hub','/property-hub','houses'],['food','Food Hub','/food-hub','cup-hot'],['convenience','Convenience Hub','/convenience-hub','basket2'],['hardware','Hardware Hub','/hardware-hub','tools'],['ride','Ride Hub','/ride-hub','taxi-front'],['delivery','Delivery Hub','/delivery-hub','truck']];
export function hubPresentation(settings){const rows=settings?.hubPresentation||[];return HUBS.map(([key,label,path,icon],i)=>{const saved=rows.find(r=>r.key===key);return {key,label:saved?.label||label,path,icon,enabled:saved?.enabled!==false,order:saved?.order??i,announcement:saved?.announcement||''};}).sort((a,b)=>a.order-b.order||a.key.localeCompare(b.key));}
export async function saveHubSettings(req,res){
 const rows=req.body.hubs;if(!Array.isArray(rows)||rows.length!==HUBS.length||new Set(rows.map(r=>r.key)).size!==HUBS.length||rows.some(r=>!HUBS.some(h=>h[0]===r.key)||typeof r.enabled!=='boolean'))fail('Provide each hub once with a visibility choice.');
 const hubPresentation=rows.map(r=>({key:r.key,label:text(r.label,40)||HUBS.find(h=>h[0]===r.key)[1],enabled:r.enabled,order:integer(r.order,0,99),announcement:text(r.announcement,240)}));
 let result;try{result=await Settings.findOneAndUpdate({_id:'hubs',revision:integer(req.body.revision,0,1e9)},{$set:{hubPresentation},$inc:{revision:1}},{new:true,upsert:req.body.revision===0,setDefaultsOnInsert:true});}catch(e){if(e.code!==11000)throw e;}if(!result)fail('Hub settings changed. Refresh and retry.',409);res.json({settings:result});
}
