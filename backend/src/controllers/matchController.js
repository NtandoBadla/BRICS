const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createMatch = async (req, res) => {
  try {
    const { competitionId, homeTeamId, awayTeamId, venue, scheduledDate } = req.body;

    const match = await prisma.match.create({
      data: {
        competitionId,
        homeTeamId,
        awayTeamId,
        venue,
        scheduledDate: new Date(scheduledDate),
        status: 'SCHEDULED'
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
    const { status, upcoming } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (upcoming === 'true') {
      where.scheduledDate = { gte: new Date() };
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
        competition: true,
        assignments: { include: { referee: { include: { user: true } } } }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json(matches);
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
        assignments: { include: { referee: { include: { user: true } } } }
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
    const { homeScore, awayScore, status } = req.body;

    const match = await prisma.match.update({
      where: { id },
      data: {
        homeScore,
        awayScore,
        status
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

const assignReferee = async (req, res) => {
  try {
    const { matchId, refereeId, role } = req.body;
    const assignment = await prisma.matchAssignment.create({
      data: { matchId, refereeId, role: role || 'MAIN_REFEREE', status: 'PENDING' },
      include: { match: { include: { homeTeam: true, awayTeam: true } }, referee: { include: { user: true } } }
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMatchAssignments = async (req, res) => {
  try {
    const { matchId } = req.params;
    const assignments = await prisma.matchAssignment.findMany({
      where: { matchId },
      include: { referee: { include: { user: true } } }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.match.delete({
      where: { id }
    });

    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
  assignReferee,
  getMatchAssignments
};
