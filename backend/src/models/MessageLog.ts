import mongoose from 'mongoose';
const schema=new mongoose.Schema({appointmentId:{type:mongoose.Schema.Types.ObjectId,ref:'Appointment',index:true},channel:{type:String,default:'whatsapp_simulado'},message:String,sentAt:{type:Date,default:Date.now},result:{type:String,default:'simulado'}},{timestamps:true});
export const MessageLog=mongoose.model('MessageLog',schema);
