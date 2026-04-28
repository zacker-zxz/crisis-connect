const jwt = require('jsonwebtoken');
const http = require('http');
const fs = require('fs');

const envMatch = fs.readFileSync('.env', 'utf-8').match(/JWT_SECRET=(.*)/);
const JWT_SECRET = envMatch ? envMatch[1].trim() : '';

const token = jwt.sign({ userId: '662f5f14e217592cf17c7689', role: 'volunteer' }, JWT_SECRET); // Using a dummy ID or I can fetch a real one

async function run() {
  const mongoose = require('mongoose');
  const uriMatch = fs.readFileSync('.env', 'utf-8').match(/MONGODB_URI=(.*)/);
  await mongoose.connect(uriMatch[1].trim());
  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String, role: String }));
  const user = await User.findOne({ role: 'volunteer' });
  if (!user) { console.log("No volunteer found"); return; }
  
  const realToken = jwt.sign({ userId: user._id.toString(), role: 'volunteer' }, JWT_SECRET);

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/volunteer/resonance',
    method: 'POST',
    headers: {
      'Cookie': `token=${realToken}`
    }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data));
  });
  req.on('error', console.error);
  req.end();
}
run();
