const https = require('https');

async function testCORS() {
  console.log('🔍 Testing CORS on deployed backend...\n');
  
  const options = {
    hostname: 'brics-platform.onrender.com',
    port: 443,
    path: '/api/users',
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://brics-platform.vercel.app',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization,content-type'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('CORS Headers:');
      console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`  Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
      console.log(`  Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
      console.log(`  Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials']}`);
      
      if (res.headers['access-control-allow-origin']) {
        console.log('\n✅ CORS is configured');
      } else {
        console.log('\n❌ CORS is NOT configured properly');
      }
      
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log('⏰ Request timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

testCORS();