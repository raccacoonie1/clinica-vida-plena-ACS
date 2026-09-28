import mongoose from 'mongoose';
export async function connectDb() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/clinica_vida_plena';
  await mongoose.connect(uri);
}
