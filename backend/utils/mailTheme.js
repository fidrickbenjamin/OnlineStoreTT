import mongoose from 'mongoose';
import SeasonalSettings from '../models/seasonalSettings.js';
import {resolveSeason,defaultSettings} from './seasonalRules.js';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cached,expires=0;
export async function emailTheme(){if(cached&&Date.now()<expires)return cached;let settings=defaultSettings();if(mongoose.connection.readyState===1)try{settings=(await SeasonalSettings.findById('storefront').lean())?.settings||settings;}catch{}const active=resolveSeason(settings,new Date()).active;cached={theme:active?.theme||'default',name:active?.holidayName||''};expires=Date.now()+60000;return cached;}
export function brandEmail(html,theme={theme:'default'}){
 const palette={madras:['#144c37','#ddaa35'],christmas:['#174c38','#bc3d36'],carnival:['#502a6e','#e5af36'],easter:['#4b6350','#b7a6c9'],newyear:['#203345','#d2ae58'],default:['#174c38','#d2a64b']}[theme.theme]||['#174c38','#d2a64b'];
 const trim=theme.theme==='madras'?'<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>'+['#ddaa35','#b53832','#e8d986','#20573e','#ddaa35','#b53832','#e8d986','#20573e'].map(c=>`<td height="8" bgcolor="${c}"></td>`).join('')+'</tr></table>':`<div style="height:6px;background:${palette[1]}"></div>`;
 const header=`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif"><tr><td style="background:${palette[0]};padding:24px;color:#fff"><strong style="font-size:23px">Tactical Trends</strong><br><span style="font-size:14px">Market Place${theme.name?' · '+escape(theme.name):''}</span></td></tr></table>${trim}`;
 const footer=`${trim}<p style="font:12px Arial,sans-serif;color:#667264;text-align:center;padding:18px">Tactical Trends Market Place · Dominica<br>Sign in to your account for current order and payment details.</p>`;
 return /<body[\s>]/i.test(html)?html.replace(/<body([^>]*)>/i,`<body$1>${header}`).replace(/<\/body>/i,footer+'</body>'):`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f8f6ed"><div style="max-width:680px;margin:auto;background:#fff">${header}${html}${footer}</div></body></html>`;
}
export const plainFromHtml=html=>String(html).replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
