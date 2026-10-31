import mongoose from 'mongoose';
const {Schema}=mongoose;
// Private collection: never joined into customer catalogue responses.
const costs=new Schema({_id:String,kind:{type:String,enum:['menu','product']},item:Schema.Types.ObjectId,business:Schema.Types.ObjectId,inventory:{type:String,enum:['procure','prepaid'],default:'procure'},costCents:{type:Number,min:0},variants:[{_id:false,id:String,costCents:{type:Number,min:0}}],extras:[{_id:false,id:String,costCents:{type:Number,min:0}}],revision:{type:Number,default:0},changedBy:Schema.Types.ObjectId},{timestamps:true});
const terms=new Schema({_id:Schema.Types.ObjectId,frequency:{type:String,enum:['immediate','fortnightly','monthly'],default:'immediate'},anchor:Date,creditLimitCents:{type:Number,min:0},reference:String,revision:{type:Number,default:0}},{timestamps:true});
export const ItemCost=mongoose.model('CommercialItemCost',costs);
export const BusinessTerms=mongoose.model('CommercialBusinessTerms',terms);
