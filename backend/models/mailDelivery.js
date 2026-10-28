import mongoose from 'mongoose';
const {Schema}=mongoose;
const attempt=new Schema({provider:String,to:String,subject:String,status:{type:String,enum:['Sent','Failed','Unknown']},code:String,messageId:String},{timestamps:true});attempt.index({createdAt:1},{expireAfterSeconds:30*86400});
export const MailAttempt=mongoose.model('MailAttempt',attempt);
const outbox=new Schema({key:{type:String,unique:true},to:String,subject:String,html:{type:String,select:false},text:{type:String,select:false},status:{type:String,enum:['Pending','Sending','Sent','Failed','Unknown'],default:'Pending'},attempts:{type:Number,default:0},startedAt:Date,sentAt:Date,code:String,messageId:String},{timestamps:true});outbox.index({status:1,createdAt:1});outbox.index({createdAt:1},{expireAfterSeconds:60*86400});
export const MailOutbox=mongoose.model('MailOutbox',outbox);
