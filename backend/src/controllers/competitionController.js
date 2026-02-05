const prisma = require('../prisma');
const { footballApi } = require('../services/footballApi');

// Competition Management
const createCompetition = async (req, res) => {
  try {
    const { name, description, startDate, endDate, location, format } = req.body;
    
    const competition = await prisma.competition.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        format: format || 'LEAGUE'
      }
    });
    
    res.status(201).json(competition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCompetitions = async (req, res) => {
  try {
    const { country, season = '2023' } = req.query;

    // Try to get from external API first
    if (process.env.FOOTBALL_API_KEY && footballApi) {
      try {
        const data = await footballApi.getLeagues(country, season);
        if (data && Array.isArray(data.response) && data.response.length > 0) {
          const competitions = data.response.map(item => ({
            id: item.league.id,
            name: item.league.name,
            type: item.league.type,
            logo: item.league.logo,
            country: item.country.name,
            season: item.seasons.length ? item.seasons[item.seasons.length - 1].year.toString() : season
          }));
          return res.json(competitions);
        }
      } catch (apiError) {
        console.error('API Error:', apiError.message);
      }
    }

    // Fallback to database
    const competitions = await prisma.competition.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (competitions.length > 0) {
      return res.json(competitions);
    }

    // Mock data as last resort
    res.json([
      { id: 1, name: 'BRICS Championship 2024', type: 'Cup', country: 'International', season: '2024' },
      { id: 2, name: 'Premier League', type: 'League', country: 'England', season: '2024' }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCompetitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        },
        standings: {
          include: { team: true },
          orderBy: { position: 'asc' }
        }
      }
    });
    
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }
    
    res.json(competition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, location, status, format } = req.body;
    
    const competition = await prisma.competition.update({
      where: { id },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        status,
        format
      }
    });
    
    res.json(competition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCompetition = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.competition.delete({ where: { id } });
    res.json({ message: 'Competition deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCompetitionStandings = async (req, res) => {
  try {
    const { id } = req.params;
    const standings = await prisma.standing.findMany({
      where: { competitionId: id },
      include: { team: true },
      orderBy: { position: 'asc' }
    });
    
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Match Management
const createMatch = async (req, res) => {
  try {
    const { competitionId, homeTeamId, awayTeamId, scheduledAt, venue } = req.body;
    
    const match = await prisma.match.create({
      data: {
        competitionId,
        homeTeamId,
        awayTeamId,
        scheduledAt: new Date(scheduledAt),
        venue
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true
      }
    });
    
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMatches = async (req, res) => {
  try {
    const { league = '39', season = '2023', date } = req.query;

    // Try external API first
    if (process.env.FOOTBALL_API_KEY && footballApi) {
      try {
        const data = await footballApi.getFixtures(league, season, date);
        if (data && Array.isArray(data.response) && data.response.length > 0) {
          const matches = data.response.map(item => ({
            id: item.fixture?.id,
            homeTeam: item.teams?.home?.name,
            homeTeamLogo: item.teams?.home?.logo,
            awayTeam: item.teams?.away?.name,
            awayTeamLogo: item.teams?.away?.logo,
            date: item.fixture?.date,
            venue: item.fixture?.venue?.name,
            status: item.fixture?.status?.short
          }));
          return res.json(matches);
        }
      } catch (apiError) {
        console.error('API Error:', apiError.message);
      }
    }

    // Fallback to database
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true
      },
      orderBy: { scheduledAt: 'desc' }
    });
    
    if (matches.length > 0) {
      return res.json(matches);
    }

    // Mock data
    res.json([
      {
        id: 1,
        homeTeam: 'Brazil',
        awayTeam: 'Russia',
        date: '2024-02-15',
        venue: 'Stadium A'
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        events: {
          include: { player: true, team: true },
          orderBy: { minute: 'asc' }
        },
        statistics: {
          include: { team: true }
        }
      }
    });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, venue, status, homeScore, awayScore } = req.body;
    
    const match = await prisma.match.update({
      where: { id },
      data: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        venue,
        status,
        homeScore,
        awayScore
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true
      }
    });
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.match.delete({ where: { id } });
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLiveMatches = async (req, res) => {
  try {
    const liveMatches = await prisma.match.findMany({
      where: { status: 'LIVE' },
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    res.json(liveMatches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Match Events & Statistics
const createMatchEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { playerId, teamId, type, minute, details } = req.body;
    
    const event = await prisma.matchEvent.create({
      data: {
        matchId: id,
        playerId,
        teamId,
        type,
        minute,
        details
      },
      include: {
        player: true,
        team: true
      }
    });
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMatchEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const events = await prisma.matchEvent.findMany({
      where: { matchId: id },
      include: {
        player: true,
        team: true
      },
      orderBy: { minute: 'asc' }
    });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMatchStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamId, statType, value } = req.body;
    
    const statistic = await prisma.matchStatistic.create({
      data: {
        matchId: id,
        teamId,
        statType,
        value
      },
      include: { team: true }
    });
    
    res.status(201).json(statistic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMatchStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const statistics = await prisma.matchStatistic.findMany({
      where: { matchId: id },
      include: { team: true }
    });
    
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMatchScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { homeScore, awayScore } = req.body;
    
    const match = await prisma.match.update({
      where: { id },
      data: { homeScore, awayScore },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
  getCompetitionStandings,
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
  getLiveMatches,
  createMatchEvent,
  getMatchEvents,
  createMatchStatistics,
  getMatchStatistics,
  updateMatchScore
};