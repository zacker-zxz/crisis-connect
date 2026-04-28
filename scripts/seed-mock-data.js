const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Manually parse .env file
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

mongoose.connect(MONGODB_URI).then(() => console.log('Connected to actual DB from .env'));

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

const ALL_SKILLS = ['First Aid', 'Logistics', 'Search & Rescue', 'Medical', 'Debris Clearing', 'Food Distribution'];

const MUMBAI_CENTER = { lat: 19.0760, lng: 72.8777 };
const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

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

async function seed() {
  console.log("Not deleting old data as requested...");
  
  const ngos = [];
  const ngoData = [
    { name: "Mumbai Relief Corps", desc: "Specializing in urban flood rescue and food distribution across the Greater Mumbai region.", email: `mumbai.relief.${Date.now()}@example.com` },
    { name: "Sahyadri Rescue Force", desc: "Mountain and landslide rescue operations covering Pune and the Western Ghats.", email: `sahyadri.${Date.now()}@example.com` },
    { name: "Red Cross Coastal", desc: "Medical emergencies and coastal storm response in Maharashtra.", email: `redcross.${Date.now()}@example.com` },
    { name: "Dharavi Action Group", desc: "Community-driven disaster response focusing on high-density urban areas.", email: `dharavi.${Date.now()}@example.com` }
  ];

  for (let i = 0; i < ngoData.length; i++) {
    const ngo = await User.create({
      name: `Admin - ${ngoData[i].name}`,
      email: ngoData[i].email,
      password: 'hashedpassword_placeholder', // doesn't matter, just mock NGOs to own tasks
      role: 'ngo',
      organizationName: ngoData[i].name,
      publicDescription: ngoData[i].desc,
      location: i % 2 === 0 ? MUMBAI_CENTER : PUNE_CENTER
    });
    ngos.push(ngo);
  }

  const missionTitles = [
    "Flood Victim Evacuation", "Medical Camp Setup", "Debris Clearance at collapsed building", 
    "Food Ration Distribution", "Emergency Blood Drive", "Transport Vehicles Needed",
    "Waterlogging Drain Clearing", "Temporary Shelter Assembly", "Search Mission in Slum Area",
    "Power Restitution Logistics"
  ];

  let addedMissions = 0;
  for (let i = 1; i <= 60; i++) {
    const isMumbai = Math.random() < 0.75; 
    const center = isMumbai ? MUMBAI_CENTER : PUNE_CENTER;
    const loc = getRandomLocation(center, 15000); // spread across ~15km
    
    const ngo = ngos[Math.floor(Math.random() * ngos.length)];
    const titleBase = missionTitles[Math.floor(Math.random() * missionTitles.length)];
    
    await Task.create({
      title: `${titleBase} - Sector ${i}`,
      description: `Critical situation reported. We need immediate volunteer assistance for ${titleBase.toLowerCase()}.`,
      priority: ['Critical', 'Urgent', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 5)],
      requiredSkills: [], // Empty skills means NO filters will block it, any volunteer will see it!
      requiredVolunteers: Math.floor(Math.random() * 15) + 2,
      filledVolunteers: Math.floor(Math.random() * 2),
      location: { lat: loc.lat, lng: loc.lng, address: isMumbai ? `Mumbai Region ${i}` : `Pune Region ${i}` },
      ngoId: ngo._id,
      status: 'open'
    });
    addedMissions++;
  }
  
  console.log(`Seeded ${addedMissions} new missions with NO skill requirements (so everyone sees them) and mock NGOs.`);
  process.exit(0);
}

seed();
