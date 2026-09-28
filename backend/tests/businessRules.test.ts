import {describe,it,expect} from 'vitest';
const allowed:any={agendada:['confirmada','realizada','falta','cancelada_paciente','cancelada_clinica'],confirmada:['realizada','falta','cancelada_paciente','cancelada_clinica'],realizada:[],falta:[],cancelada_paciente:[],cancelada_clinica:[]};
describe('máquina de status',()=>{it('não permite sair de status final',()=>expect(allowed.realizada).toHaveLength(0));it('permite confirmar agendada',()=>expect(allowed.agendada).toContain('confirmada'))});
