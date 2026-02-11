const https = require('https');

async function testAdminStats() {
  console.log('🔍 Testing admin stats endpoint...\n');
  
  // First, wake up the service
  console.log('Waking up service...');
  await new Promise((resolve) => {
    const req = https.get('https://brics-platform.onrender.com/', (res) => {
      console.log(`Root endpoint status: ${res.statusCode}`);
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(10000, () => { req.destroy(); resolve(false); });
  });

  // Wait for service to fully wake up
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test the admin stats endpoint
  const options = {
    hostname: 'brics-platform.onrender.com',
    port: 443,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Origin': 'https://brics-platform.vercel.app',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi0xIiwiZW1haWwiOiJhZG1pbkBiaWZhLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczOTI2MjM2MSwiZXhwIjoxNzM5MzQ4NzYxfQ.FgJQJzqvKea8XkDCkk-b5OhreKinIXCf_GatM7_ZyG0',
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`\n/api/admin/stats Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`Response: ${JSON.stringify(parsed, null, 2)}`);
        } catch {
          console.log(`Response: ${data}`);
        }
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(15000, () => {
      console.log('⏰ Request timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

testAdminStats();