const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.FOOTBALL_API_KEY || 'XxXxXxXxXxXxXxXxXxXxXxXx';

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

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // Check for API-level errors (e.g. quota reached)
      if (data.errors && Object.keys(data.errors).length > 0) {
        console.warn('⚠️ Football API returned errors:', JSON.stringify(data.errors));
      }

      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getSeasons() {
    try {
      const response = await fetch(`${FOOTBALL_API_BASE}/leagues/seasons`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
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

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // Check for API-level errors (e.g. quota reached)
      if (data.errors && Object.keys(data.errors).length > 0) {
        console.warn('⚠️ Football API returned errors:', JSON.stringify(data.errors));
      }

      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getTeamStatistics(team, league, season) {
    try {
      const response = await fetch(`${FOOTBALL_API_BASE}/teams/statistics?team=${team}&league=${league}&season=${season}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getTeamSeasons(team) {
    try {
      const response = await fetch(`${FOOTBALL_API_BASE}/teams/seasons?team=${team}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getTeamCountries() {
    try {
      const response = await fetch(`${FOOTBALL_API_BASE}/teams/countries`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getStandings(league, season) {
    try {
      const response = await fetch(`${FOOTBALL_API_BASE}/standings?league=${league}&season=${season}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getFixturePlayers(fixture) {
    try {
      const response = await fetch(`${FOOTBALL_API_BASE}/fixtures/players?fixture=${fixture}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getFixtures(league, season, date) {
    try {
      let url = `${FOOTBALL_API_BASE}/fixtures?league=${league}&season=${season}`;
      if (date) url += `&date=${date}`;

      console.log('Fetching fixtures from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', { results: data.results, errors: data.errors });
      
      return data;
    } catch (error) {
      console.error('Football API Error (Fixtures):', error);
      throw error;
    }
  },

  async getTopScorers(league, season) {
    try {
      const response = await fetch(`${FOOTBALL_API_BASE}/players/topscorers?league=${league}&season=${season}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getSquad(team) {
    try {
      const response = await fetch(`${FOOTBALL_API_BASE}/players/squads?team=${team}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  },

  async getTransfers(team) {
    try {
      const response = await fetch(`${FOOTBALL_API_BASE}/transfers?team=${team}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Football API Error:', error);
      throw error;
    }
  }
};

module.exports = { footballApi };