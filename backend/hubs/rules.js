import ErrorHandler from '../utils/errorHandler.js';
export const fail=(message,code=400)=>{throw new ErrorHandler(message,code);};
export const text=(value,max=500)=>String(value??'').trim().slice(0,max);
export function cents(value){const n=Number(value);if(!Number.isFinite(n)||n<0||n>1000000)fail('Enter an amount from 0 to 1,000,000 XCD.');return Math.round((n+Number.EPSILON)*100);}
export function integer(value,min,max){const n=Number(value);if(!Number.isInteger(n)||n<min||n>max)fail(`Enter a whole number from ${min} to ${max}.`);return n;}
export function coordinate(lat,lng){lat=Number(lat);lng=Number(lng);if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<15.1||lat>15.7||lng< -61.6||lng> -61.2)fail('Choose a pickup and destination in Dominica.');return {lat,lng};}
export function point(value,required=true){const v=value||{},out={label:text(v.label,180),community:text(v.community,80),contact:text(v.contact,80),phone:text(v.phone,40),notes:text(v.notes,400)};if(required&&(!out.label||!out.community||!out.phone))fail('Complete the address / landmark, community and contact phone.');if(v.lat!==undefined&&v.lat!==''&&v.lng!==undefined&&v.lng!=='')Object.assign(out,coordinate(v.lat,v.lng));return out;}
export function image(value){const url=text(value,1200);if(url&&!/^https:\/\//i.test(url))fail('Images must use a public HTTPS URL.');return url;}
export function quoteValues(job,body){const feeCents=cents(body.fee),driverCents=job.fulfilment==='collection'?0:cents(body.driverPay);if(driverCents>feeCents)fail('Driver pay cannot exceed the service fee.');if(job.fulfilment==='collection'&&feeCents!==0)fail('Collection orders have no delivery fee.');return {feeCents,driverCents,totalCents:job.itemsCents+feeCents,expiresAt:new Date(Date.now()+30*60000),note:text(body.note),source:'Admin confirmed'};}
export function payoutAmount(value){const n=cents(value);if(n<100)fail('Minimum payout request is XCD 1.00.');return n;}
