const http = require('http');

const testUrls = [
  'http://localhost:5000',
  'http://localhost:5000/api/competitions/matches'
];

async function testConnection(url) {
  return new Promise((resolve) => {
    console.log(`Testing: ${url}`);
    
    const req = http.get(url, (res) => {
      console.log(`✅ ${url} - Status: ${res.statusCode}`);
      console.log(`   CORS Headers:`);
      console.log(`     Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`     Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
      console.log(`     Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(parsed, null, 2)}`);
        } catch {
          console.log(`   Response: ${data.substring(0, 200)}...`);
        }
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${url} - Error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${url} - Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🔍 Testing Local Backend Connection...\n');
  
  for (const url of testUrls) {
    await testConnection(url);
    console.log('');
  }
  
  console.log('✅ Test completed');
}

runTests();