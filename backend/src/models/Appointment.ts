import mongoose from 'mongoose';
const schema=new mongoose.Schema({externalId:{type:String,unique:true,sparse:true,index:true},patientId:{type:String,index:true},patientName:String,patientPhone:String,attendanceType:{type:String,enum:['convenio','particular']},doctorId:{type:String,index:true},bookedAt:Date,appointmentAt:{type:Date,index:true},status:{type:String,enum:['agendada','confirmada','realizada','falta','cancelada_paciente','cancelada_clinica'],index:true},lateCancellation:{type:Boolean,default:false},penalty:{type:Boolean,default:false},source:{type:String,default:'system'}},{timestamps:true});
schema.index({doctorId:1,appointmentAt:1},{unique:true,partialFilterExpression:{status:{$in:['agendada','confirmada']}}});
export const Appointment=mongoose.model('Appointment',schema);
