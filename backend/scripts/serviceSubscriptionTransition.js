// Optional pre-deployment migration. Dry-run unless --apply is supplied.
// Uses existing environment variables; never writes credentials or invents payments.
import fs from 'node:fs/promises';
import mongoose from 'mongoose';
import {ServiceBusiness} from '../servicesHub/models.js';
import {cents,text} from '../hubs/rules.js';
const args=process.argv.slice(2),input=args[args.indexOf('--input')+1];
if(!args.includes('--input')||!input)throw Error('Usage: node serviceSubscriptionTransition.js --input transition.json [--apply]');
const rows=JSON.parse(await fs.readFile(input,'utf8'));
if(!Array.isArray(rows)||!rows.length||rows.length>500)throw Error('Supply 1–500 explicit business transition records.');
const seen=new Set();for(const row of rows){if(!mongoose.isValidObjectId(row.business)||seen.has(row.business)||!text(row.reference,200)||!text(row.plan,80)||row.monthlyFee==null||row.monthlyFee==='')throw Error('Each record needs a unique business ID, plan, monthlyFee and documented reference.');seen.add(row.business);row.feeCents=cents(row.monthlyFee);row.through=new Date(row.paidThrough);if(!Number.isFinite(+row.through)||+row.through<=Date.now())throw Error('Every explicit paidThrough date must be in the future.');}
const uri=process.env.NODE_ENV==='PRODUCTION'?process.env.DB_URI:process.env.DB_LOCAL_URI;if(!uri)throw Error('Load your existing database environment first.');
await mongoose.connect(uri);
try{const changes=[];for(const row of rows){const b=await ServiceBusiness.findById(row.business).lean();if(!b)throw Error(`Business not found: ${row.business}`);const s=b.subscription||{};if(s.transitionReference===row.reference&&+new Date(s.paidThrough)===+row.through&&s.feeCents===row.feeCents){console.log(`Already transitioned: ${b._id} ${b.name}`);continue;}if(s.paidThrough||s.invoices?.length)throw Error(`Billing already exists for ${b._id}; use the admin panel instead.`);changes.push({row,b});}
 console.log(`${args.includes('--apply')?'APPLY':'DRY RUN'}: ${changes.length} explicit listing transitions. No arrears or payment receipts will be created.`);
 for(const {row,b} of changes){if(args.includes('--apply')){const r=await ServiceBusiness.updateOne({_id:b._id,'subscription.paidThrough':{$exists:false},'subscription.revision':b.subscription?.revision||{$in:[0,null]}},{$set:{'subscription.plan':text(row.plan,80),'subscription.feeCents':row.feeCents,'subscription.paidThrough':row.through,'subscription.transitionReference':text(row.reference,200)},$inc:{'subscription.revision':1},$push:{'subscription.audit':{action:'Documented pre-deployment transition',reference:text(row.reference,200),at:new Date()}}});if(!r.modifiedCount)throw Error(`Billing changed concurrently for ${b._id}. Stop and review.`);}console.log(`${b._id} ${b.name}: current through ${row.through.toISOString()}`);}
}finally{await mongoose.disconnect();}
