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
        format: format || 'LEAGUE',
        createdBy: req.user.id
      }
    });
    
    res.status(201).json(competition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCompetitions = async (req, res) => {
  try {
    const { createdByRole, upcoming } = req.query;
    
    // Auto-delete old completed/cancelled competitions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await prisma.competition.deleteMany({
      where: {
        endDate: { lt: thirtyDaysAgo },
        status: { in: ['COMPLETED', 'CANCELLED'] }
      }
    });
    
    let whereClause = {};
    
    // Filter by creator role if specified
    if (createdByRole) {
      whereClause.creator = {
        role: createdByRole
      };
    }
    
    // Filter upcoming competitions only
    if (upcoming === 'true') {
      const now = new Date();
      whereClause.endDate = { gte: now };
      whereClause.status = { in: ['UPCOMING', 'ONGOING'] };
    }
    
    const competitions = await prisma.competition.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        matches: true
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Add season field for compatibility
    const competitionsWithSeason = competitions.map(comp => ({
      ...comp,
      season: new Date(comp.startDate).getFullYear().toString(),
      teams: [] // Placeholder for compatibility
    }));
    
    res.json(competitionsWithSeason);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    res.json([]);
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
    console.log('Creating match with data:', req.body);
    const { competitionId, homeTeamId, awayTeamId, scheduledAt, venue } = req.body;
    
    if (!competitionId || !homeTeamId || !awayTeamId || !scheduledAt || !venue) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
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
    
    console.log('Match created successfully:', match.id);
    res.status(201).json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: error.message });
  }
};

const getMatches = async (req, res) => {
  try {
    const { upcoming } = req.query;
    
    // Auto-delete old completed matches (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await prisma.match.deleteMany({
      where: {
        scheduledAt: { lt: thirtyDaysAgo },
        status: { in: ['FULL_TIME', 'CANCELLED'] }
      }
    });
    
    let whereClause = {};
    
    // Filter upcoming matches only
    if (upcoming === 'true') {
      const now = new Date();
      whereClause.scheduledAt = { gte: now };
      whereClause.status = { in: ['SCHEDULED', 'LIVE'] };
    }
    
    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        assignments: { include: { referee: { include: { user: true } } } }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    
    // Format matches for frontend
    const formattedMatches = matches.map(match => ({
      id: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeTeamLogo: match.homeTeam.logoUrl,
      awayTeamLogo: match.awayTeam.logoUrl,
      date: match.scheduledAt.toISOString().split('T')[0],
      time: match.scheduledAt.toTimeString().slice(0, 5),
      venue: match.venue,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      competition: match.competition,
      scheduledAt: match.scheduledAt
    }));
    
    res.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.json([]);
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