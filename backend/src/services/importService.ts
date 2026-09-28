import fs from 'node:fs/promises'; import {parse as parseCsv} from 'csv-parse/sync';
import {Appointment} from '../models/Appointment.js'; import {Doctor} from '../models/Doctor.js'; import {Patient} from '../models/Patient.js';
import {completeness,normalizeAttendance,normalizePhone,normalizeStatus,parseClinicDate} from '../utils/normalization.js'; import type {DoctorInput} from '../types/domain.js';
export interface ImportReport {read:number;imported:number;corrected:number;discarded:number;duplicatesResolved:number;reasons:Record<string,number>}
export async function importData(csvPath:string,jsonPath:string):Promise<ImportReport>{
 const doctors=JSON.parse(await fs.readFile(jsonPath,'utf8')) as DoctorInput[]; await Doctor.deleteMany({}); await Doctor.insertMany(doctors.map(d=>({externalId:d.id,nome:d.nome,especialidade:d.especialidade,grade:d.grade})));
 const rows=parseCsv(await fs.readFile(csvPath,'utf8'),{columns:true,skip_empty_lines:true,trim:true}) as Record<string,string>[]; const report:ImportReport={read:rows.length,imported:0,corrected:0,discarded:0,duplicatesResolved:0,reasons:{}};
 const grouped=new Map<string,Record<string,string>[]>(); for(const r of rows){const a=grouped.get(r.id)??[]; a.push(r); grouped.set(r.id,a)}
 const selected:Record<string,string>[]=[]; for(const arr of grouped.values()){if(arr.length>1) report.duplicatesResolved+=arr.length-1; arr.sort((a,b)=>{const c=completeness(b)-completeness(a); if(c) return c; return (parseClinicDate(b.data_agendamento)?.getTime()??0)-(parseClinicDate(a.data_agendamento)?.getTime()??0)}); selected.push(arr[0]);}
 await Appointment.deleteMany({source:'import'}); const patientMap=new Map<string,{externalId:string,nome:string,telefone?:string}>();
 for(const r of selected){const status=normalizeStatus(r.status), attendanceType=normalizeAttendance(r.tipo_atendimento), bookedAt=parseClinicDate(r.data_agendamento), appointmentAt=parseClinicDate(r.data_consulta); const phone=normalizePhone(r.paciente_telefone);
  const fail=(why:string)=>{report.discarded++; report.reasons[why]=(report.reasons[why]??0)+1}; if(!status){fail('status_invalido_ou_ausente');continue} if(!attendanceType){fail('tipo_atendimento_invalido');continue} if(!bookedAt||!appointmentAt){fail('data_invalida');continue} if(!doctors.some(d=>d.id===r.medico_id)){fail('medico_inexistente');continue}
  if(status!==r.status?.trim().toLowerCase()||attendanceType!==r.tipo_atendimento?.trim().toLowerCase()||phone!==r.paciente_telefone) report.corrected++;
  try{await Appointment.create({externalId:r.id,patientId:r.paciente_id,patientName:r.paciente_nome,patientPhone:phone,attendanceType,doctorId:r.medico_id,bookedAt,appointmentAt,status,source:'import'}); report.imported++; patientMap.set(r.paciente_id,{externalId:r.paciente_id,nome:r.paciente_nome,telefone:phone});}catch{fail('conflito_de_slot_ou_id')}
 }
 await Patient.bulkWrite([...patientMap.values()].map(p=>({updateOne:{filter:{externalId:p.externalId},update:{$set:p},upsert:true}}))); return report;
}
