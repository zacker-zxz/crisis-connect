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
} catch(e) {
  console.log("Could not read .env file");
}

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ngo', 'volunteer'], required: true },
  skills: [String],
  organizationName: String,
  publicDescription: String,
  location: { lat: Number, lng: Number }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['Critical', 'Urgent', 'High', 'Medium', 'Low'], required: true },
  requiredSkills: [String],
  requiredVolunteers: { type: Number, required: true },
  filledVolunteers: { type: Number, default: 0 },
  location: { lat: Number, lng: Number, address: String },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'open' }
});
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

const MUMBAI = { lat: 19.0760, lng: 72.8777, name: 'Mumbai' };
const NAVI_MUMBAI = { lat: 19.0330, lng: 73.0297, name: 'Navi Mumbai' };
const PUNE = { lat: 18.5204, lng: 73.8567, name: 'Pune' };

const INDIA_CITIES = [
  { lat: 28.7041, lng: 77.1025, name: 'Delhi' },
  { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' }
];

function getRandomLocation(center, radius) {
  const y0 = center.lat;
  const x0 = center.lng;
  const rd = radius / 111300; 
  const u = Math.random();
  const v = Math.random();
  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  return { lat: y + y0, lng: x + x0 };
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const deleteResult = await Task.deleteMany({ title: /Sector \d+/ });
  console.log(`Removed ${deleteResult.deletedCount} old mock missions.`);

  const ngos = await User.find({ role: 'ngo' });
  if (ngos.length === 0) {
    console.log("No NGOs found to attach tasks to!");
    process.exit(1);
  }

  const missionTitles = [
    "Flood Victim Evacuation", "Medical Camp Setup", "Debris Clearance", 
    "Food Ration Distribution", "Emergency Blood Drive", "Transport Vehicles Needed",
    "Waterlogging Drain Clearing", "Temporary Shelter Assembly", "Search Mission",
    "Power Restitution Logistics"
  ];

  let addedMissions = 0;

  // Reduced to 21 (30 - 30%)
  for (let i = 1; i <= 21; i++) {
    const r = Math.random();
    let city = r < 0.45 ? MUMBAI : (r < 0.8 ? NAVI_MUMBAI : PUNE);
    const loc = getRandomLocation(city, 10000); 
    
    const ngo = ngos[Math.floor(Math.random() * ngos.length)];
    const titleBase = missionTitles[Math.floor(Math.random() * missionTitles.length)];
    
    await Task.create({
      title: `${titleBase} - Sector ${addedMissions}`,
      description: `Immediate volunteer assistance for ${titleBase.toLowerCase()} in ${city.name}.`,
      priority: ['Critical', 'Urgent', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 5)],
      requiredSkills: [], 
      requiredVolunteers: Math.floor(Math.random() * 15) + 2,
      filledVolunteers: Math.floor(Math.random() * 2),
      location: { lat: loc.lat, lng: loc.lng, address: `${city.name} Region` },
      ngoId: ngo._id,
      status: 'Open',
      dateTime: new Date()
    });
    addedMissions++;
  }

  // Reduced to 28 (40 - 30%)
  for (let i = 1; i <= 28; i++) {
    const city = INDIA_CITIES[Math.floor(Math.random() * INDIA_CITIES.length)];
    const loc = getRandomLocation(city, 15000); 
    
    const ngo = ngos[Math.floor(Math.random() * ngos.length)];
    const titleBase = missionTitles[Math.floor(Math.random() * missionTitles.length)];
    
    await Task.create({
      title: `${titleBase} - Sector ${addedMissions}`,
      description: `National Response: Assistance required for ${titleBase.toLowerCase()} in ${city.name}.`,
      priority: ['Critical', 'Urgent', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 5)],
      requiredSkills: [], 
      requiredVolunteers: Math.floor(Math.random() * 10) + 2,
      filledVolunteers: 0,
      location: { lat: loc.lat, lng: loc.lng, address: `${city.name} Region` },
      ngoId: ngo._id,
      status: 'Open',
      dateTime: new Date()
    });
    addedMissions++;
  }
  
  console.log(`Seeded exactly 49 missions (21 in MH, 28 across India).`);
  process.exit(0);
}

run();
