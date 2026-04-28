import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/volunteer/resonance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '60d5ecb8b392d7001f3e3901', // Example fake ID, but it needs a real one to not return 404
      'x-user-role': 'volunteer'
    },
    body: '{}'
  });
  const data = await res.json();
  console.log(res.status, data);
}

test();
