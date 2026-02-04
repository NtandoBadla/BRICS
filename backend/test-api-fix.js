require('dotenv').config({ path: '.env' });

const { footballApi } = require('./src/services/footballApi');

async function testFootballAPIFix() {
  console.log('🔍 Testing Football API with fixes...\n');
  
  try {
    // Test 1: Get leagues without parameters (should work)
    console.log('Test 1: Getting leagues...');
    const leagues = await footballApi.getLeagues();
    console.log('✅ Leagues API Success - Results:', leagues.results);
    
    if (leagues.response && leagues.response.length > 0) {
      console.log('Sample league:', leagues.response[0].league.name);
    }
    
    // Test 2: Get seasons
    console.log('\nTest 2: Getting seasons...');
    const seasons = await footballApi.getSeasons();
    console.log('✅ Seasons API Success - Results:', seasons.results);
    
    // Test 3: Get fixtures for Premier League 2023
    console.log('\nTest 3: Getting fixtures for Premier League 2023...');
    const fixtures = await footballApi.getFixtures(39, 2023);
    console.log('✅ Fixtures API Success - Results:', fixtures.results);
    
    console.log('\n🎉 All tests passed! API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Additional debugging
    if (error.message.includes('403')) {
      console.log('\n🔧 Debugging 403 error:');
      console.log('- Check if API key is valid');
      console.log('- Verify API key has not expired');
      console.log('- Check if you have exceeded daily quota');
      console.log('- Try generating a new API key from api-football.com');
    }
  }
}

testFootballAPIFix();