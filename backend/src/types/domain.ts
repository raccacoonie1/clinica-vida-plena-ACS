export type AppointmentStatus='agendada'|'confirmada'|'realizada'|'falta'|'cancelada_paciente'|'cancelada_clinica';
export type AttendanceType='convenio'|'particular';
export interface Grade { dia:string; inicio:string; fim:string }
export interface DoctorInput { id:string; nome:string; especialidade:string; grade:Grade[] }
