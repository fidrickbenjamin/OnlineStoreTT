import mongoose from 'mongoose';
// Validated/whitelisted in seasonalRules before persistence. One atomic revision.
const schema=new mongoose.Schema({_id:{type:String,default:'storefront'},revision:{type:Number,default:0},settings:{type:mongoose.Schema.Types.Mixed,required:true},updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
export default mongoose.model('SeasonalSettings',schema);
