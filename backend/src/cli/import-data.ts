import 'dotenv/config'; import path from 'node:path'; import {connectDb} from '../config/db.js'; import {importData} from '../services/importService.js';
await connectDb(); const dir=process.env.DATA_DIR??path.resolve('../data'); const report=await importData(path.join(dir,'agendamentos.csv'),path.join(dir,'medicos.json')); console.log(JSON.stringify(report,null,2)); process.exit(0);
