import mongoose from 'mongoose';
const schema=new mongoose.Schema({externalId:{type:String,unique:true,index:true},nome:String,especialidade:String,grade:[{dia:String,inicio:String,fim:String}]},{timestamps:true});
export const Doctor=mongoose.model('Doctor',schema);
