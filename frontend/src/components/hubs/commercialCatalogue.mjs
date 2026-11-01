export const PRICING_HUBS=[['food','Food Hub','cup-hot'],['convenience','Convenience Hub','basket2'],['hardware','Hardware Hub','tools'],['marketplace','Marketplace','shop'],['all','All businesses','grid']];
const id=value=>String(value?._id||value||'');
export const pricingHub=b=>b?.type==='Hardware Store'?'hardware':b?.type==='Convenience Store'?'convenience':'food';
const known=value=>Number.isSafeInteger(value)&&value>=0;
export function missingCosts(item,cost){
 const missing=[];
 if(!cost||!['prepaid','procure'].includes(cost.inventory))missing.push('Stock ownership');
 if(cost?.inventory==='procure'&&!cost.business)missing.push('Supplier');
 if(item.variants?.length){for(const v of item.variants)if(!known(cost?.variants?.find(c=>c.id===v.id)?.costCents))missing.push(v.name);}
 else if(!known(cost?.costCents))missing.push('Purchase cost');
 for(const extra of item.options||[])if(!known(cost?.extras?.find(c=>c.id===id(extra))?.costCents))missing.push(extra.name);
 return missing;
}
export function pricingItems(data){
 const businesses=new Map((data.businesses||[]).map(b=>[id(b),b])),costs=new Map((data.costs||[]).map(c=>[c._id,c]));
 return [...(data.menu||[]).map(m=>({...m,kind:'menu'})),...(data.products||[]).map(p=>({...p,kind:'product',priceCents:Math.round(p.price*100)}))].map(item=>{
  const key=`${item.kind}:${item._id}`,cost=costs.get(key),supplier=businesses.get(id(cost?.business)),b=businesses.get(id(item.business));
  const businessKey=item.kind==='menu'?id(item.business):!cost?'unassigned':cost.inventory==='prepaid'?'owned':id(cost.business)||'unassigned';
  const businessName=item.kind==='menu'?b?.name||'Business unavailable':businessKey==='owned'?'Tactical Trends-owned stock':businessKey==='unassigned'?'Unassigned — needs review':supplier?.name||'Supplier unavailable';
  const category=typeof item.category==='string'?item.category.trim():[item.category?.main,item.category?.sub].filter(Boolean).join(' / ');
  return {...item,key,cost,businessKey,businessName,hub:item.kind==='product'?'marketplace':pricingHub(b),category:category||'Uncategorised',missing:missingCosts(item,cost)};
 }).sort((a,b)=>a.businessName.localeCompare(b.businessName)||a.category.localeCompare(b.category)||a.name.localeCompare(b.name));
}
export function pricingBusinesses(data,items,hub){
 const groups=new Map();
 if(hub!=='marketplace'&&hub!=='all')for(const b of data.businesses||[])if(pricingHub(b)===hub)groups.set(id(b),{key:id(b),name:b.name,archived:b.archived,count:0,missing:0});
 if(hub==='marketplace')for(const [key,name] of [['owned','Tactical Trends-owned stock'],['unassigned','Unassigned — needs review']])groups.set(key,{key,name,count:0,missing:0});
 for(const i of items.filter(i=>hub==='all'||i.hub===hub)){const key=hub==='all'?`${i.hub}:${i.businessKey}`:i.businessKey;if(!groups.has(key))groups.set(key,{key,name:i.businessName,count:0,missing:0});const g=groups.get(key);g.count++;if(i.missing.length)g.missing++;}
 return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
export function filterPricingItems(items,{hub,business,category='',search='',missingOnly=false}){const q=search.trim().toLowerCase();return items.filter(i=>(hub==='all'||i.hub===hub)&&(business==='all'||i.businessKey===business)&&(!category||i.category===category)&&(!q||[i.name,...(i.variants||[]).map(v=>v.name)].some(n=>n.toLowerCase().includes(q)))&&(!missingOnly||i.missing.length>0));}
