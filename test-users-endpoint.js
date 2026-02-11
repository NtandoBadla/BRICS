const https = require('https');

async function testUsersEndpoint() {
  console.log('🔍 Testing /api/users endpoint...\n');
  
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

  // Wait a moment for service to fully wake up
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test the users endpoint with proper headers
  const options = {
    hostname: 'brics-platform.onrender.com',
    port: 443,
    path: '/api/users',
    method: 'GET',
    headers: {
      'Origin': 'https://brics-platform.vercel.app',
      'Authorization': 'Bearer test-token',
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`\n/api/users Status: ${res.statusCode}`);
      console.log('Response Headers:');
      Object.keys(res.headers).forEach(key => {
        if (key.startsWith('access-control')) {
          console.log(`  ${key}: ${res.headers[key]}`);
        }
      });
      
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

testUsersEndpoint();