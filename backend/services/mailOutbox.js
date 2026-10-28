import crypto from 'node:crypto';
import mongoose from 'mongoose';
import {MailOutbox} from '../models/mailDelivery.js';
import sendEmail,{mailStatus} from '../utils/sendEmail.js';
export async function queueMail(options,key){await MailOutbox.init();const digest=crypto.createHash('sha256').update(key||JSON.stringify(options)).digest('hex');try{return await MailOutbox.create({key:digest,to:options.email,subject:options.subject,html:options.html,text:options.text,status:'Pending'});}catch(e){if(e.code===11000)return await MailOutbox.findOne({key:digest});throw e;}}
let busy=false;
export async function drainMail(){if(busy||mongoose.connection.readyState!==1||!mailStatus().configured)return;busy=true;try{
 await MailOutbox.updateMany({status:'Sending',startedAt:{$lt:new Date(Date.now()-120000)}},{$set:{status:'Unknown',code:'WORKER_INTERRUPTED'}});
 for(let i=0;i<2;i++){const entry=await MailOutbox.findOneAndUpdate({status:'Pending'},{$set:{status:'Sending',startedAt:new Date()},$inc:{attempts:1}},{sort:{createdAt:1},new:true}).select('+html +text');if(!entry)break;try{const result=await sendEmail({email:entry.to,subject:entry.subject,html:entry.html,text:entry.text});await MailOutbox.updateOne({_id:entry._id,status:'Sending'},{$set:{status:'Sent',sentAt:new Date(),messageId:String(result.messageId||'').slice(0,180),code:''}});}catch(e){await MailOutbox.updateOne({_id:entry._id,status:'Sending'},{$set:{status:e.deliveryUnknown?'Unknown':'Failed',code:e.code||'MAIL_FAILED'}});}}
 }finally{busy=false;}}
// Durable queue survives application restarts. Free-instance sleep pauses this worker.
const timer=setInterval(()=>{if(process.env.MAIL_WORKER_DISABLED!=='true')drainMail().catch(()=>console.error('Mail worker could not complete its batch.'));},6000);timer.unref();
