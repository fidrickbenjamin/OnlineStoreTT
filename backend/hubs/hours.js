import {fail} from './rules.js';
const availabilityClock=new Intl.DateTimeFormat('en-US',{timeZone:'America/Dominica',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}),summaryClock=new Intl.DateTimeFormat('en-US',{timeZone:'America/Dominica',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}),displayClock=new Intl.DateTimeFormat('en-US',{timeZone:'America/Dominica',hour:'numeric',minute:'2-digit'}),weekdayClock=new Intl.DateTimeFormat('en-US',{timeZone:'America/Dominica',weekday:'long'});
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
 const parts=availabilityClock.formatToParts(date),get=k=>parts.find(p=>p.type===k).value;
 const day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday')),now=Number(get('hour'))*60+Number(get('minute')),today=b.schedule.days[day],yesterday=b.schedule.days[(day+6)%7];
 const current=today?.enabled&&(minute(today.open)<minute(today.close)?now>=minute(today.open)&&now<minute(today.close):now>=minute(today.open));
 const overnight=yesterday?.enabled&&minute(yesterday.open)>minute(yesterday.close)&&now<minute(yesterday.close);
 return {isOpen:Boolean(current||overnight),openLabel:current||overnight?'Open':'Outside opening hours'};
}
export const publicBusiness=b=>({...b,...businessAvailability(b),hoursSummary:openingSummary(b)});

export function openingSummary(b,date=new Date()){
 const active=businessAvailability(b,date);if(!b.schedule?.enabled||b.schedule.days.length!==7)return {...active,todayIndex:null,todayHours:b.hours||'Contact the restaurant for opening hours',message:active.isOpen?'Taking orders now':active.openLabel};
 const p=summaryClock.formatToParts(date),get=k=>p.find(x=>x.type===k).value,index=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday')),today=b.schedule.days[index],time=t=>displayClock.format(t),midnight=+date-(Number(get('hour'))*3600+Number(get('minute'))*60+Number(get('second')))*1000-date.getMilliseconds();
 const todayHours=today.enabled?`${today.open}–${today.close}${today.close<today.open?' (next day)':''}`:'Closed';let boundary=null;
 if(b.acceptingOrders&&b.status==='Approved'){
  const candidates=[];for(let i=-1;i<=7;i++){const row=b.schedule.days[(index+i+7)%7];if(!row?.enabled)continue;for(const t of [midnight+i*86400000+minute(row.open)*60000,midnight+(i+(row.close<row.open?1:0))*86400000+minute(row.close)*60000])if(t>+date&&businessAvailability(b,new Date(t)).isOpen!==active.isOpen)candidates.push(t);}boundary=candidates.length?Math.min(...candidates):null;
 }
 let message=active.openLabel;if(boundary){const dayOffset=Math.floor((boundary-midnight)/86400000),day=dayOffset===0?'today':dayOffset===1?'tomorrow':weekdayClock.format(boundary);message=`${active.isOpen?'Closes':'Opens'} ${day} at ${time(boundary)}`;}else if(active.isOpen)message='Taking orders now';else if(b.acceptingOrders)message='No opening scheduled in the next seven days';
 return {...active,todayIndex:index,todayHours,message,nextChangeAt:boundary?new Date(boundary).toISOString():null};
}
