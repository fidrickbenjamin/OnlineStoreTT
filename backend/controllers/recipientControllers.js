import mongoose from 'mongoose';
import User from '../models/user.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import {deliveryAddress,safeUser} from '../utils/accountRules.js';
export const saveRecipient=catchAsyncErrors(async(req,res)=>{
 let data;try{data=deliveryAddress(req.body,{recipient:true});}catch(error){throw new ErrorHandler(error.message,400);}
 const user=await User.findById(req.user._id),rows=user.savedRecipients.map(item=>item.toObject()),id=req.params.id;
 if(id){const index=rows.findIndex(row=>String(row._id)===id);if(index<0)throw new ErrorHandler('Recipient not found.',404);rows[index]={...data,_id:rows[index]._id};}
 else{if(rows.length>=12)throw new ErrorHandler('You can save up to 12 recipients.',400);rows.push({...data,_id:new mongoose.Types.ObjectId()});}
 await commit(req,res,user,rows,user.defaultRecipientId||'self');
});
async function commit(req,res,user,rows,defaultRecipientId){
 if(!Number.isInteger(req.body.revision)||req.body.revision!==(user.recipientRevision||0))throw new ErrorHandler('Recipients changed elsewhere. Reload the page and try again.',409);
 const filter={_id:req.user._id,...(req.body.revision===0?{$or:[{recipientRevision:0},{recipientRevision:{$exists:false}}]}:{recipientRevision:req.body.revision})};
 const saved=await User.findOneAndUpdate(filter,{$set:{savedRecipients:rows,defaultRecipientId},$inc:{recipientRevision:1}},{new:true,runValidators:true});
 if(!saved)throw new ErrorHandler('Recipients changed elsewhere. Reload the page and try again.',409);
 res.json({success:true,user:safeUser(saved)});
}
export const deleteRecipient=catchAsyncErrors(async(req,res)=>{const user=await User.findById(req.user._id);if(!user.savedRecipients.some(row=>String(row._id)===req.params.id))throw new ErrorHandler('Recipient not found.',404);await commit(req,res,user,user.savedRecipients.filter(row=>String(row._id)!==req.params.id).map(row=>row.toObject()),user.defaultRecipientId===req.params.id?'self':user.defaultRecipientId||'self');});
export const setDefaultRecipient=catchAsyncErrors(async(req,res)=>{const user=await User.findById(req.user._id),id=req.body.recipientId||'self';if(id!=='self'&&!user.savedRecipients.some(row=>String(row._id)===id))throw new ErrorHandler('Recipient not found.',404);await commit(req,res,user,user.savedRecipients.map(row=>row.toObject()),id);});
