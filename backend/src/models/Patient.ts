import mongoose from 'mongoose';
const schema=new mongoose.Schema({externalId:{type:String,unique:true,index:true},nome:String,telefone:String},{timestamps:true});
export const Patient=mongoose.model('Patient',schema);
