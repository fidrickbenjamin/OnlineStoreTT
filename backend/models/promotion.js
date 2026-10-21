import mongoose from "mongoose";
const schema = new mongoose.Schema({
 name: {type:String,required:true,trim:true,maxlength:100},
 label: {type:String,trim:true,maxlength:40,default:"Sale"},
 bannerText: {type:String,trim:true,maxlength:200,default:""},
 discountType: {type:String,enum:["percent","fixed","price"],required:true},
 value: {type:Number,required:true,min:0.01},
 scope: {type:String,enum:["products","category"],required:true},
 products: [{type:mongoose.Schema.Types.ObjectId,ref:"Product"}],
 category: {type:String,default:""},
 startsAt: {type:Date,required:true}, endsAt: {type:Date,required:true},
 status: {type:String,enum:["draft","enabled","paused","ended"],default:"draft"},
 createdBy: {type:mongoose.Schema.Types.ObjectId,ref:"User"},
}, {timestamps:true,optimisticConcurrency:true});
schema.index({status:1,startsAt:1,endsAt:1});
export default mongoose.model("Promotion",schema);
