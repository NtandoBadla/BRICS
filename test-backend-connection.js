const https = require('https');

const testUrls = [
  'https://brics-backend.onrender.com',
  'https://brics-backend.onrender.com/api/competitions/matches'
];

async function testConnection(url) {
  return new Promise((resolve) => {
    console.log(`Testing: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`✅ ${url} - Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
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

    req.setTimeout(10000, () => {
      console.log(`⏰ ${url} - Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  console.log('🔍 Testing Backend Connection...\n');
  
  for (const url of testUrls) {
    await testConnection(url);
    console.log('');
  }
  
  console.log('✅ Test completed');
}

runTests();