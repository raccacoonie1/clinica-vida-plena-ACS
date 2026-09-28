import {parse} from 'date-fns';
import {fromZonedTime} from 'date-fns-tz';
import type {AppointmentStatus,AttendanceType} from '../types/domain.js';
const statusMap:Record<string,AppointmentStatus>={realizada:'realizada',atendido:'realizada',falta:'falta',faltou:'falta',no_show:'falta',ausente:'falta',agendada:'agendada',confirmada:'confirmada',confirmado:'confirmada',cancelado:'cancelada_paciente',cancelada_paciente:'cancelada_paciente','cancelado pelo paciente':'cancelada_paciente',desmarcou:'cancelada_paciente','cancelado clinica':'cancelada_clinica',cancelada_clinica:'cancelada_clinica'};
export function normalizeStatus(v?:string){return statusMap[(v??'').trim().toLowerCase()];}
export function normalizeAttendance(v?:string):AttendanceType|undefined {const n=(v??'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); return n==='convenio'||n==='particular'?n:undefined;}
export function normalizePhone(v?:string){const d=(v??'').replace(/\D/g,''); if(!d) return undefined; const n=d.startsWith('55')?d:`55${d}`; return n.length>=12&&n.length<=13?n:undefined;}
export function parseClinicDate(v:string){for(const fmt of ['yyyy-MM-dd HH:mm','dd/MM/yyyy HH:mm']){const d=parse(v,fmt,new Date()); if(!Number.isNaN(d.getTime())) return fromZonedTime(d,'America/Sao_Paulo');} return undefined;}
export function completeness(r:Record<string,string>){return Object.values(r).filter(v=>String(v??'').trim()!=='').length;}
