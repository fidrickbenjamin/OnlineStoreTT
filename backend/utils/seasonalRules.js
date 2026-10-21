// Calendar days and storefront windows are evaluated in Dominica (UTC-4).
// Annual rules are local; special/substitute dates can be entered by staff.
export const DAY=86400000;
export const THEME_CATALOG=[
 {id:'default',name:'Classic / announcement',eyebrow:'Tactical Trends',title:'Something special, close to home.',message:'Discover your next favourite find.'},
 {id:'carnival',name:'Carnival',eyebrow:'Colour. Culture. Celebration.',title:'Bring on the Carnival vibes.',message:'A little more colour. A whole lot of celebration.'},
 {id:'madras',name:'Dominican madras',eyebrow:'Rooted in Dominica',title:'Our culture. Our colours. Our home.',message:'Celebrating the spirit of Dominica, woven into everything we do.'},
 {id:'christmas',name:'Christmas',eyebrow:'A season for giving',title:'Make a little Christmas magic.',message:'Thoughtful finds, festive moments, and gifts from the heart.'},
 {id:'newyear',name:'New Year',eyebrow:'Here’s to new beginnings',title:'Fresh year. New possibilities.',message:'Step into the new year with something to look forward to.'},
 {id:'easter',name:'Easter / spring',eyebrow:'A fresh little beginning',title:'Welcome a brighter season.',message:'Discover thoughtful finds for the days ahead.'},
];
const entry=(id,name,theme,enabled=false,daysBefore=0,daysAfter=0,priority=50)=>({id,name,theme,enabled,daysBefore,daysAfter,priority,title:'',message:'',link:'/deals',linkLabel:'Explore the shop',dateOverrides:[]});
export const HOLIDAY_DEFAULTS=[
 entry('newyear','New Year’s Day','newyear',true,1,2,80),
 entry('carnivalMonday','Carnival Monday','carnival',true,14,0,70),
 entry('carnivalTuesday','Carnival Tuesday','carnival',true,0,0,70),
 entry('goodFriday','Good Friday','easter'),entry('easterMonday','Easter Monday','easter'),
 entry('labour','Labour Day','default'),entry('whitMonday','Whit Monday','default'),
 entry('emancipation','Emancipation Day','madras'),
 entry('independence','Independence Day / Creole season','madras',true,33,1,70),
 entry('community','National Day of Community Service','madras'),
 entry('christmas','Christmas Day','christmas',true,24,1,70),entry('boxing','Boxing Day','christmas'),
];
export const defaultSettings=()=>({mode:'auto',intensity:'festive',animations:true,decorations:true,override:{theme:'christmas',endsAt:null},holidays:HOLIDAY_DEFAULTS.map(row=>({...row,dateOverrides:[]})),customEvents:[]});
export function isoDay(date){return new Date(date).toISOString().slice(0,10);}
export function dominicaYear(now){return new Date(+new Date(now)-4*3600000).getUTCFullYear();}
export function easterDay(year){
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),n=h+l-7*m+114;
 return new Date(Date.UTC(year,Math.floor(n/31)-1,n%31+1));
}
const offsetDay=(date,offset)=>isoDay(+new Date(date)+offset*DAY);
const firstMonday=(year,month)=>{const d=new Date(Date.UTC(year,month,1));return offsetDay(d,(8-d.getUTCDay())%7);};
export function holidayDates(year){
 const easter=easterDay(year),fixed=(month,day)=>`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
 return {newyear:fixed(1,1),carnivalMonday:offsetDay(easter,-48),carnivalTuesday:offsetDay(easter,-47),goodFriday:offsetDay(easter,-2),easterMonday:offsetDay(easter,1),labour:firstMonday(year,4),whitMonday:offsetDay(easter,50),emancipation:firstMonday(year,7),independence:fixed(11,3),community:fixed(11,4),christmas:fixed(12,25),boxing:fixed(12,26)};
}
const validDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(+new Date(value))&&isoDay(value)===value&&Number(value.slice(0,4))>=2020&&Number(value.slice(0,4))<=2199;
const text=(value,max)=>{if(typeof value!=='string'||value.length>max)throw Error(`Text must be within ${max} characters.`);return value.trim();};
const integer=(value,min,max)=>{if(!Number.isInteger(value)||value<min||value>max)throw Error(`Enter a whole number between ${min} and ${max}.`);return value;};
export function validateSettings(body,now=new Date()){
 if(!body||!['off','auto','manual'].includes(body.mode)||!['subtle','festive','full'].includes(body.intensity)||typeof body.animations!=='boolean'||typeof body.decorations!=='boolean')throw Error('Choose valid theme settings.');
 const themeIds=THEME_CATALOG.map(theme=>theme.id);
 const row=(input,custom=false)=>{
  if(!input||typeof input.enabled!=='boolean'||!themeIds.includes(input.theme))throw Error('Choose a valid holiday and theme.');
  const out={id:text(input.id,80),enabled:input.enabled,theme:input.theme,daysBefore:integer(input.daysBefore,0,60),daysAfter:integer(input.daysAfter,0,30),priority:integer(input.priority,0,100),title:text(input.title||'',100),message:text(input.message||'',240),link:text(input.link||'',200),linkLabel:text(input.linkLabel||'',40)};
  if(out.link&&!/^\/(?!\/)[a-zA-Z0-9/_?=&%#.+-]*$/.test(out.link))throw Error('Banner links must be internal shop paths, for example /deals.');
  if(!Array.isArray(input.dateOverrides)||input.dateOverrides.length>30)throw Error('Too many annual date overrides.');
  const years=new Set();out.dateOverrides=input.dateOverrides.map(item=>{if(!validDay(item?.date)||Number(item.date.slice(0,4))!==item.year||years.has(item.year))throw Error('Each date override needs a unique matching year and valid date.');years.add(item.year);return {year:item.year,date:item.date};});
  if(custom){if(!/^custom-[a-zA-Z0-9-]{1,60}$/.test(out.id)||!validDay(input.baseDate)||typeof input.repeatAnnual!=='boolean')throw Error('Custom events need a valid date and ID.');Object.assign(out,{name:text(input.name,80),baseDate:input.baseDate,repeatAnnual:input.repeatAnnual});if(!out.name)throw Error('Name your custom event.');}
  else {const original=HOLIDAY_DEFAULTS.find(item=>item.id===out.id);if(!original)throw Error('Unknown holiday.');out.name=original.name;}
  return out;
 };
 if(!Array.isArray(body.holidays)||body.holidays.length!==HOLIDAY_DEFAULTS.length||new Set(body.holidays.map(item=>item.id)).size!==HOLIDAY_DEFAULTS.length)throw Error('Supply all calendar holidays once.');
 if(!Array.isArray(body.customEvents)||body.customEvents.length>30)throw Error('Up to 30 custom events are supported.');
 const holidays=body.holidays.map(item=>row(item)),customEvents=body.customEvents.map(item=>row(item,true));if(new Set(customEvents.map(item=>item.id)).size!==customEvents.length)throw Error('Custom event IDs must be unique.');
 const override={theme:body.override?.theme||'christmas',endsAt:body.override?.endsAt||null};if(!themeIds.includes(override.theme))throw Error('Choose a manual theme.');
 if(override.endsAt){const end=new Date(override.endsAt);if(!Number.isFinite(+end))throw Error('Choose a valid manual end time.');override.endsAt=end.toISOString();}
 if(body.mode==='manual'&&(!override.endsAt||+new Date(override.endsAt)<=+now||+new Date(override.endsAt)>+now+366*DAY))throw Error('Manual themes need a future end time within one year.');
 return {mode:body.mode,intensity:body.intensity,animations:body.animations,decorations:body.decorations,override,holidays,customEvents};
}
export function calendarRows(settings,year){
 const dates=holidayDates(year);
 return [...settings.holidays,...settings.customEvents].map(row=>{
  let ruleDate=dates[row.id]||null;
  if(row.baseDate){ruleDate=row.repeatAnnual?`${year}${row.baseDate.slice(4)}`:Number(row.baseDate.slice(0,4))===year?row.baseDate:null;if(ruleDate&&!validDay(ruleDate))ruleDate=null;}
  const date=row.dateOverrides?.find(item=>item.year===year)?.date||ruleDate;
  if(!date)return {...row,ruleDate,date:null,startsAt:null,endsAt:null};
  const midnight=+new Date(`${date}T00:00:00-04:00`);
  return {...row,ruleDate,date,startsAt:new Date(midnight-row.daysBefore*DAY).toISOString(),endsAt:new Date(midnight+(row.daysAfter+1)*DAY).toISOString()};
 });
}
export function presentation(theme,settings,row={}){
 const preset=THEME_CATALOG.find(item=>item.id===theme)||THEME_CATALOG[0];
 return {theme:preset.id,themeName:preset.name,eyebrow:preset.eyebrow,title:row.title||preset.title,message:row.message||preset.message,link:row.link??'/deals',linkLabel:row.linkLabel||'Explore the shop',intensity:settings.intensity,animations:settings.animations,decorations:settings.decorations,holidayId:row.id||null,holidayName:row.name||null,startsAt:row.startsAt||null,endsAt:row.endsAt||null};
}
export function resolveSeason(settings,now=new Date()){
 const stamp=+new Date(now),year=dominicaYear(now),future=[];
 if(settings.mode==='off')return {active:null,nextChangeAt:null};
 if(settings.mode==='manual'&&+new Date(settings.override.endsAt)>stamp)return {active:presentation(settings.override.theme,settings,{endsAt:settings.override.endsAt}),nextChangeAt:new Date(settings.override.endsAt).toISOString()};
 const windows=[year-1,year,year+1].flatMap(y=>calendarRows(settings,y)).filter(row=>row.enabled&&row.startsAt);
 for(const row of windows)for(const value of [row.startsAt,row.endsAt])if(+new Date(value)>stamp)future.push(+new Date(value));
 const selected=windows.filter(row=>+new Date(row.startsAt)<=stamp&&stamp<+new Date(row.endsAt)).sort((a,b)=>b.priority-a.priority||+new Date(b.startsAt)-+new Date(a.startsAt)||a.id.localeCompare(b.id))[0];
 return {active:selected?presentation(selected.theme,settings,selected):null,nextChangeAt:future.length?new Date(Math.min(...future)).toISOString():null};
}
