const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let MONGODB_URI = process.env.MONGODB_URI;
try {
  const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf-8');
  const match = envContent.match(/MONGODB_URI=(.*)/);
  if (match && match[1]) {
    MONGODB_URI = match[1].trim();
  }
} catch(e) {}

if (!MONGODB_URI) { process.exit(1); }

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const TaskSchema = new mongoose.Schema({ dateTime: Date }, { strict: false });
  const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

  const res = await Task.updateMany({ dateTime: { $exists: false } }, { $set: { dateTime: new Date() } });
  console.log(`Updated ${res.modifiedCount} tasks to have a dateTime field to fix Mongoose validation`);
  process.exit(0);
}
run();
