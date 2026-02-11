const https = require('https');

async function testDebugCounts() {
  console.log('🔍 Testing debug counts endpoint...\n');
  
  // Wake up service first
  await new Promise((resolve) => {
    const req = https.get('https://brics-platform.onrender.com/', (res) => {
      console.log(`Root endpoint status: ${res.statusCode}`);
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(10000, () => { req.destroy(); resolve(false); });
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test debug endpoint
  const options = {
    hostname: 'brics-platform.onrender.com',
    port: 443,
    path: '/api/debug/counts',
    method: 'GET'
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`\n/api/debug/counts Status: ${res.statusCode}`);
      
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

testDebugCounts();