const { footballApi } = require('../services/footballApi');

const getLeagues = async (req, res) => {
  try {
    const { country, season } = req.query;
    const data = await footballApi.getLeagues(country, season);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSeasons = async (req, res) => {
  try {
    const data = await footballApi.getSeasons();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const { league, season, id } = req.query;
    const data = await footballApi.getTeams(league, season, id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeamStatistics = async (req, res) => {
  try {
    const { team, league, season } = req.query;

    if (!team || !league || !season) {
      return res.status(400).json({ error: 'Team, league and season are required' });
    }

    const data = await footballApi.getTeamStatistics(team, league, season);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeamSeasons = async (req, res) => {
  try {
    const { team } = req.query;

    if (!team) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const data = await footballApi.getTeamSeasons(team);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeamCountries = async (req, res) => {
  try {
    const data = await footballApi.getTeamCountries();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStandings = async (req, res) => {
  try {
    const { league, season } = req.query;

    if (!league || !season) {
      return res.status(400).json({ error: 'League and season are required' });
    }

    const data = await footballApi.getStandings(league, season);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFixturePlayers = async (req, res) => {
  try {
    const { fixture } = req.query;

    if (!fixture) {
      return res.status(400).json({ error: 'Fixture ID is required' });
    }

    const data = await footballApi.getFixturePlayers(fixture);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFixtures = async (req, res) => {
  try {
    const { league, season, date } = req.query;

    if (!league || !season) {
      return res.status(400).json({ error: 'League and season are required' });
    }

    const data = await footballApi.getFixtures(parseInt(league), parseInt(season), date);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTopScorers = async (req, res) => {
  try {
    const { league, season } = req.query;

    if (!league || !season) {
      return res.status(400).json({ error: 'League and season are required' });
    }

    const data = await footballApi.getTopScorers(league, season);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSquad = async (req, res) => {
  try {
    const { team } = req.query;

    if (!team) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const data = await footballApi.getSquad(team);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransfers = async (req, res) => {
  try {
    const { team } = req.query;

    if (!team) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const data = await footballApi.getTransfers(team);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLeagues,
  getSeasons,
  getTeams,
  getTeamStatistics,
  getTeamSeasons,
  getTeamCountries,
  getStandings,
  getFixturePlayers,
  getFixtures,
  getTopScorers,
  getSquad,
  getTransfers
};