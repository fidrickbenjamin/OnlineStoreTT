import {fail} from './rules.js';
export function weeklyHours(value){
 if(!value?.enabled)return {enabled:false,days:[]};
 if(!Array.isArray(value.days)||value.days.length!==7)fail('Set opening hours for all seven days.');
 const days=value.days.map(d=>{if(!d||typeof d.enabled!=='boolean'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.open)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.close)||d.enabled&&d.open===d.close)fail('Use valid opening and closing times. Closing after midnight is supported; equal times are not.');return {enabled:d.enabled,open:d.open,close:d.close};});
 return {enabled:true,days};
}
const minute=t=>Number(t.split(':')[0])*60+Number(t.split(':')[1]);
export function businessAvailability(b,date=new Date()){
 if(b.status!=='Approved'||!b.acceptingOrders)return {isOpen:false,openLabel:b.acceptingOrders?'Closed':'Orders paused'};
 if(!b.schedule?.enabled)return {isOpen:true,openLabel:'Open'};
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Dominica',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date),get=k=>parts.find(p=>p.type===k).value;
 const day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday')),now=Number(get('hour'))*60+Number(get('minute')),today=b.schedule.days[day],yesterday=b.schedule.days[(day+6)%7];
 const current=today?.enabled&&(minute(today.open)<minute(today.close)?now>=minute(today.open)&&now<minute(today.close):now>=minute(today.open));
 const overnight=yesterday?.enabled&&minute(yesterday.open)>minute(yesterday.close)&&now<minute(yesterday.close);
 return {isOpen:Boolean(current||overnight),openLabel:current||overnight?'Open':'Outside opening hours'};
}
export const publicBusiness=b=>({...b,...businessAvailability(b)});
