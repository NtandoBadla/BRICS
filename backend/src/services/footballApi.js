const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY || 'XxXxXxXxXxXxXxXxXxXxXxXx';

// Log API key status on module load
console.log('Football API Key Status:', API_KEY && API_KEY !== 'XxXxXxXxXxXxXxXxXxXxXxXx' ? 'Valid key loaded' : 'No valid key found');
console.log('API Key (first 8 chars):', API_KEY ? API_KEY.substring(0, 8) + '...' : 'None');

// Helper function to make API requests with multiple authentication methods
const makeAPIRequest = async (url, retries = 1) => {
  const authMethods = [
    { 'x-apisports-key': API_KEY },
    { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': 'v3.football.api-sports.io' }
  ];

  for (const headers of authMethods) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Attempting API request with headers:`, Object.keys(headers));
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${Object.keys(headers)[0]}, attempt ${attempt}): ${response.status} ${response.statusText}`);
          console.error('Error response:', errorText);
          
          if (attempt === retries) {
            continue; // Try next auth method
          }
          continue; // Retry with same auth method
        }

        const data = await response.json();
        
        // Check for API-level errors
        if (data.errors && Object.keys(data.errors).length > 0) {
          console.warn('⚠️ Football API returned errors:', JSON.stringify(data.errors));
          if (data.errors.token) {
            continue; // Try next auth method
          }
        }
        
        console.log(`✅ API request successful with ${Object.keys(headers)[0]}`);
        return data;
      } catch (error) {
        console.error(`Request failed with ${Object.keys(headers)[0]}:`, error.message);
        if (attempt === retries) {
          continue; // Try next auth method
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
  }
  
  // If all auth methods fail, throw error
  throw new Error('All authentication methods failed. Please check your API key.');
};

// Fallback data for when API is unavailable
const getFallbackData = (type, params = {}) => {
  switch (type) {
    case 'leagues':
      return {
        results: 5,
        response: [
          { league: { id: 1, name: 'BRICS Championship', type: 'League', logo: 'https://placehold.co/40x40?text=BC' }, country: { name: 'International' }, seasons: [{ year: 2024 }] },
          { league: { id: 2, name: 'Premier League', type: 'League', logo: 'https://placehold.co/40x40?text=PL' }, country: { name: 'England' }, seasons: [{ year: 2024 }] },
          { league: { id: 3, name: 'La Liga', type: 'League', logo: 'https://placehold.co/40x40?text=LL' }, country: { name: 'Spain' }, seasons: [{ year: 2024 }] },
          { league: { id: 4, name: 'Serie A', type: 'League', logo: 'https://placehold.co/40x40?text=SA' }, country: { name: 'Italy' }, seasons: [{ year: 2024 }] },
          { league: { id: 5, name: 'Bundesliga', type: 'League', logo: 'https://placehold.co/40x40?text=BL' }, country: { name: 'Germany' }, seasons: [{ year: 2024 }] }
        ]
      };
    case 'fixtures':
      return {
        results: 3,
        response: [
          {
            fixture: { id: 1, date: '2024-02-15T15:00:00Z', venue: { name: 'Stadium A' }, status: { short: 'FT' } },
            teams: { 
              home: { name: 'Brazil', logo: 'https://placehold.co/60x60?text=BRA' },
              away: { name: 'Russia', logo: 'https://placehold.co/60x60?text=RUS' }
            }
          },
          {
            fixture: { id: 2, date: '2024-02-16T18:00:00Z', venue: { name: 'Stadium B' }, status: { short: 'NS' } },
            teams: { 
              home: { name: 'India', logo: 'https://placehold.co/60x60?text=IND' },
              away: { name: 'China', logo: 'https://placehold.co/60x60?text=CHN' }
            }
          },
          {
            fixture: { id: 3, date: '2024-02-17T20:00:00Z', venue: { name: 'Stadium C' }, status: { short: 'NS' } },
            teams: { 
              home: { name: 'South Africa', logo: 'https://placehold.co/60x60?text=RSA' },
              away: { name: 'Brazil', logo: 'https://placehold.co/60x60?text=BRA' }
            }
          }
        ]
      };
    case 'teams':
      return {
        results: 5,
        response: [
          { team: { id: 1, name: 'Brazil', logo: 'https://placehold.co/60x60?text=BRA', founded: 1914 }, venue: { name: 'Maracanã' } },
          { team: { id: 2, name: 'Russia', logo: 'https://placehold.co/60x60?text=RUS', founded: 1912 }, venue: { name: 'Luzhniki' } },
          { team: { id: 3, name: 'India', logo: 'https://placehold.co/60x60?text=IND', founded: 1937 }, venue: { name: 'Salt Lake Stadium' } },
          { team: { id: 4, name: 'China', logo: 'https://placehold.co/60x60?text=CHN', founded: 1924 }, venue: { name: 'Workers Stadium' } },
          { team: { id: 5, name: 'South Africa', logo: 'https://placehold.co/60x60?text=RSA', founded: 1991 }, venue: { name: 'FNB Stadium' } }
        ]
      };
    case 'seasons':
      return {
        results: 5,
        response: [2024, 2023, 2022, 2021, 2020]
      };
    default:
      return { results: 0, response: [] };
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
      console.error('Football API Error (getLeagues):', error.message);
      console.log('🔄 Returning fallback data for leagues');
      return getFallbackData('leagues');
    }
  },

  async getSeasons() {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/leagues/seasons`);
    } catch (error) {
      console.error('Football API Error (getSeasons):', error.message);
      console.log('🔄 Returning fallback data for seasons');
      return getFallbackData('seasons');
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
      console.error('Football API Error (getTeams):', error.message);
      console.log('🔄 Returning fallback data for teams');
      return getFallbackData('teams');
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
      console.error('Football API Error (getTeamStatistics):', error.message);
      return { results: 0, response: null };
    }
  },

  async getTeamSeasons(team) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/teams/seasons?team=${team}`);
    } catch (error) {
      console.error('Football API Error (getTeamSeasons):', error.message);
      return getFallbackData('seasons');
    }
  },

  async getTeamCountries() {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/teams/countries`);
    } catch (error) {
      console.error('Football API Error (getTeamCountries):', error.message);
      return { results: 5, response: ['Brazil', 'Russia', 'India', 'China', 'South Africa'] };
    }
  },

  async getStandings(league, season) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/standings?league=${league}&season=${season}`);
    } catch (error) {
      console.error('Football API Error (getStandings):', error.message);
      return { results: 0, response: [] };
    }
  },

  async getFixturePlayers(fixture) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/fixtures/players?fixture=${fixture}`);
    } catch (error) {
      console.error('Football API Error (getFixturePlayers):', error.message);
      return { results: 0, response: [] };
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
      console.error('Football API Error (getFixtures):', error.message);
      console.log('🔄 Returning fallback data for fixtures');
      return getFallbackData('fixtures');
    }
  },

  async getTopScorers(league, season) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/players/topscorers?league=${league}&season=${season}`);
    } catch (error) {
      console.error('Football API Error (getTopScorers):', error.message);
      return { results: 0, response: [] };
    }
  },

  async getSquad(team) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/players/squads?team=${team}`);
    } catch (error) {
      console.error('Football API Error (getSquad):', error.message);
      return { results: 0, response: [] };
    }
  },

  async getTransfers(team) {
    try {
      return await makeAPIRequest(`${FOOTBALL_API_BASE}/transfers?team=${team}`);
    } catch (error) {
      console.error('Football API Error (getTransfers):', error.message);
      return { results: 0, response: [] };
    }
  }
};

module.exports = { footballApi };