require('dotenv').config({ path: '.env' });

const API_KEY = process.env.FOOTBALL_API_KEY;

async function validateAPIKey() {
  console.log('🔍 Validating Football API Key...\n');
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'NOT FOUND');
  
  if (!API_KEY) {
    console.error('❌ No API key found in environment variables');
    console.log('💡 Make sure FOOTBALL_API_KEY is set in your .env file');
    return;
  }

  // Test with the simplest endpoint
  try {
    console.log('\n🔍 Testing API status endpoint...');
    const response = await fetch('https://v3.football.api-sports.io/status', {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Key is valid!');
      console.log('Account info:', data.response);
      
      // Check quota
      if (data.response && data.response.requests) {
        const { current, limit_day } = data.response.requests;
        console.log(`📊 API Usage: ${current}/${limit_day} requests today`);
        
        if (current >= limit_day) {
          console.log('⚠️ WARNING: Daily quota exceeded!');
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API Key validation failed');
      console.error('Error:', errorText);
      
      if (response.status === 403) {
        console.log('\n💡 Possible solutions:');
        console.log('1. Check if your API key is correct');
        console.log('2. Verify your account is active on api-football.com');
        console.log('3. Check if you have exceeded your daily quota');
        console.log('4. Try generating a new API key');
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

validateAPIKey();