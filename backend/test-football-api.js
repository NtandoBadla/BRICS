require('dotenv').config({ path: '.env' });

const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY;

async function testFootballAPI() {
  console.log('Testing Football API...');
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'NOT FOUND');
  
  if (!API_KEY) {
    console.error('❌ No API key found in environment variables');
    return;
  }

  try {
    // Test API status first
    console.log('\n🔍 Testing API status...');
    const statusResponse = await fetch(`${FOOTBALL_API_BASE}/status`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ API Status:', statusData.response);
    } else {
      console.error('❌ Status check failed:', statusResponse.status);
    }

    // Test with a simple endpoint that should always return data
    console.log('\n🔍 Testing timezone endpoint...');
    const timezoneResponse = await fetch(`${FOOTBALL_API_BASE}/timezone`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (timezoneResponse.ok) {
      const timezoneData = await timezoneResponse.json();
      console.log('✅ Timezone API Success - Results:', timezoneData.results);
    } else {
      const errorText = await timezoneResponse.text();
      console.error('❌ Timezone API Error:', errorText);
    }

    // Test leagues without season filter
    console.log('\n🔍 Testing leagues endpoint without season filter...');
    const leaguesResponse = await fetch(`${FOOTBALL_API_BASE}/leagues`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('Leagues Response Status:', leaguesResponse.status);
    
    if (!leaguesResponse.ok) {
      const errorText = await leaguesResponse.text();
      console.error('❌ Leagues API Error:', errorText);
    } else {
      const leaguesData = await leaguesResponse.json();
      console.log('✅ Leagues API Success - Results:', leaguesData.results);
      console.log('Errors:', leaguesData.errors);
      if (leaguesData.response?.length > 0) {
        console.log('Sample league:', leaguesData.response[0].league);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFootballAPI();