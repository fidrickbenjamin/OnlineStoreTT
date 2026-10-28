import mongoose from 'mongoose';
const schema=new mongoose.Schema({actor:{type:mongoose.Schema.Types.ObjectId,ref:'User'},actorName:String,action:String,entity:String,method:String,values:{type:mongoose.Schema.Types.Mixed},at:{type:Date,default:Date.now}},{timestamps:false});schema.index({at:-1});export const AdminAudit=mongoose.model('HubAdminAudit',schema);
export function auditMiddleware(req,res,next){
 if(['GET','HEAD','OPTIONS'].includes(req.method))return next();
 const values={};for(const k of ['action','name','type','price','available','categoryId','status','amount','reference','direction','reason','note','enabled','order'])if(req.body?.[k]!==undefined&&['string','number','boolean'].includes(typeof req.body[k]))values[k]=String(req.body[k]).slice(0,240);
 for(const k of ['products','categories','scopes'])if(Array.isArray(req.body?.[k]))values[k]=req.body[k].map(String).slice(0,100);
 const action=req.originalUrl.split('?')[0],entity=action.split('/').filter(Boolean).at(-1);
 res.on('finish',()=>{if(res.statusCode>=200&&res.statusCode<300)AdminAudit.create({actor:req.user._id,actorName:req.user.name,action,entity,method:req.method,values}).catch(()=>console.error('Admin audit record could not be stored.'));});next();
}
export async function auditList(req,res){const page=Math.max(1,Math.min(1000000,Number(req.query.page)||1)),limit=30,[events,total]=await Promise.all([AdminAudit.find().sort({at:-1,_id:-1}).skip((page-1)*limit).limit(limit).lean(),AdminAudit.countDocuments()]);res.json({events,total,page,limit});}
