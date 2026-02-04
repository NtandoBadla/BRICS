const fetch = require('node-fetch');

async function testLeagues() {
  console.log('🔍 Testing leagues endpoint...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/competitions');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Leagues endpoint working!');
      console.log(`📊 Found ${data.length} competitions`);
      console.log('\nSample competitions:');
      data.slice(0, 5).forEach(comp => {
        console.log(`- ${comp.name} (${comp.country})`);
      });
    } else {
      console.error('❌ Leagues endpoint failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing leagues:', error.message);
  }
}

testLeagues();