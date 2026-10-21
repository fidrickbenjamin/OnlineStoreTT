import SeasonalSettings from '../models/seasonalSettings.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import {defaultSettings,validateSettings,resolveSeason,calendarRows,dominicaYear,THEME_CATALOG,presentation} from '../utils/seasonalRules.js';
const load=async()=>await SeasonalSettings.findById('storefront').lean()||{revision:0,settings:defaultSettings()};
const checked=(body,now)=>{try{return validateSettings(body,now);}catch(error){throw new ErrorHandler(error.message,400);}};
const yearOf=(value,now)=>{if(value===undefined)return dominicaYear(now);const year=Number(value);if(!Number.isInteger(year)||year<2020||year>2199)throw new ErrorHandler('Choose a calendar year between 2020 and 2199.',400);return year;};
export const activeSeason=catchAsyncErrors(async(req,res)=>{const now=new Date(),doc=await load();res.set('Cache-Control','no-store').json({success:true,...resolveSeason(doc.settings,now),serverTime:now});});
export const adminSeasons=catchAsyncErrors(async(req,res)=>{const now=new Date(),doc=await load(),year=yearOf(req.query.year,now);res.set('Cache-Control','no-store').json({success:true,revision:doc.revision,settings:doc.settings,themes:THEME_CATALOG,year,calendar:calendarRows(doc.settings,year),...resolveSeason(doc.settings,now),serverTime:now});});
export const saveSeasons=catchAsyncErrors(async(req,res)=>{
 const settings=checked(req.body.settings,new Date()),revision=req.body.revision;
 if(!Number.isInteger(revision)||revision<0)throw new ErrorHandler('Reload settings before saving.',409);
 let saved;
 try{saved=await SeasonalSettings.findOneAndUpdate({_id:'storefront',revision},{$set:{settings,updatedBy:req.user._id},$inc:{revision:1}},{new:true,upsert:revision===0,setDefaultsOnInsert:false});}catch(error){if(error.code!==11000)throw error;}
 if(!saved)throw new ErrorHandler('Settings changed elsewhere. Reload the latest settings before saving.',409);
 res.json({success:true,revision:saved.revision,settings:saved.settings});
});
export const previewSeasons=catchAsyncErrors(async(req,res)=>{
 const now=new Date(),settings=checked(req.body.settings,now),at=req.body.at?new Date(req.body.at):now;
 if(!Number.isFinite(+at)||dominicaYear(at)<2020||dominicaYear(at)>2199)throw new ErrorHandler('Choose a valid preview date.',400);
 const result=resolveSeason(settings,at),year=dominicaYear(at);let active=result.active;
 if(req.body.theme){if(!THEME_CATALOG.some(theme=>theme.id===req.body.theme))throw new ErrorHandler('Unknown preview theme.',400);active=presentation(req.body.theme,settings);}
 res.json({success:true,active,calendarActive:result.active,nextChangeAt:result.nextChangeAt,year,calendar:calendarRows(settings,year),previewTime:at});
});
