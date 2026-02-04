const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY || 'XxXxXxXxXxXxXxXxXxXxXxXx';

// Log API key status on module load
console.log('Football API Key Status:', API_KEY && API_KEY !== 'XxXxXxXxXxXxXxXxXxXxXxXx' ? 'Valid key loaded' : 'No valid key found');
console.log('API Key (first 8 chars):', API_KEY ? API_KEY.substring(0, 8) + '...' : 'None');

// Helper function to make API requests with proper error handling
const makeAPIRequest = async (url, retries = 2) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (attempt ${attempt}): ${response.status} ${response.statusText}`);
        console.error('Error response:', errorText);
        
        if (attempt === retries) {
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        continue;
      }

      const data = await response.json();
      
      // Check for API-level errors
      if (data.errors && Object.keys(data.errors).length > 0) {
        console.warn('⚠️ Football API returned errors:', JSON.stringify(data.errors));
      }
      
      return data;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`Retrying API request (attempt ${attempt + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
    }
  }
};

const footballApi = {
  async getLeagues(country, season) {
    try {
      let url = `${FOOTBALL_API_BASE}/leagues`;
      const params = new URLSearchParams();

      if (country) params.append('country', country);
      if (season) params.append('season', season.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      return await makeAPIRequest(url);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getSeasons() {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/leagues/seasons`);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getTeams(league, season, id) {
    try {
      let url = `${FOOTBALL_API_BASE}/teams`;
      const params = new URLSearchParams();

      if (id) params.append('id', id.toString());
      if (league) params.append('league', league.toString());
      if (season) params.append('season', season.toString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      return await makeAPIRequest(url);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getTeamStatistics(team, league, season) {
    try {
      const teamId = typeof team === 'object' ? team.team || team.id : team;
      const leagueId = typeof league === 'object' ? league.league || league.id : league;
      const seasonYear = typeof season === 'object' ? season.season || season.year : season;
      
      const url = `${FOOTBALL_API_BASE}/teams/statistics?team=${teamId}&league=${leagueId}&season=${seasonYear}`;
      return await makeAPIRequest(url);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getTeamSeasons(team) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/teams/seasons?team=${team}`);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getTeamCountries() {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/teams/countries`);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getStandings(league, season) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/standings?league=${league}&season=${season}`);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getFixturePlayers(fixture) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/fixtures/players?fixture=${fixture}`);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getFixtures(league, season, date) {
    try {
      const leagueId = typeof league === 'object' ? league.league || league.id : league;
      const seasonYear = typeof season === 'object' ? season.season || season.year : season;
      
      if (!leagueId || !seasonYear) {
        throw new Error('League ID and season are required');
      }

      let url = `${FOOTBALL_API_BASE}/fixtures?league=${leagueId}&season=${seasonYear}`;
      if (date) url += `&date=${date}`;

      console.log('Fetching fixtures from:', url);
      console.log('Using API Key:', API_KEY ? 'Present' : 'Missing');

      const data = await makeAPIRequest(url);
      console.log('API Response:', { results: data.results, errors: data.errors });
      
      return data;
    } catch (error) {
      console.error('Football API Error (Fixtures):', error);
      throw error;
    }
  },

  async getTopScorers(league, season) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/players/topscorers?league=${league}&season=${season}`);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getSquad(team) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/players/squads?team=${team}`);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getTransfers(team) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/transfers?team=${team}`);
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  }
};

module.exports = { footballApi };