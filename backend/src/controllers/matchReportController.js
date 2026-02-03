import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMatchReport = async (req, res) => {
  try {
    const { matchId, homeScore, awayScore, incidents, notes, yellowCards, redCards } = req.body;
    const refereeId = req.user.userId;

    const report = await prisma.matchReport.create({
      data: {
        matchId,
        refereeId,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        incidents: incidents || [],
        notes,
        yellowCards: yellowCards || [],
        redCards: redCards || [],
        status: 'SUBMITTED'
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            competition: true
          }
        },
        referee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMatchReports = async (req, res) => {
  try {
    const { status, refereeId } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (refereeId) where.refereeId = parseInt(refereeId);

    const reports = await prisma.matchReport.findMany({
      where,
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            competition: true
          }
        },
        referee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMatchReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.matchReport.findUnique({
      where: { id },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            competition: true
          }
        },
        referee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Match report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMatchReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { homeScore, awayScore, incidents, notes, yellowCards, redCards, status } = req.body;

    const report = await prisma.matchReport.update({
      where: { id },
      data: {
        homeScore: homeScore ? parseInt(homeScore) : undefined,
        awayScore: awayScore ? parseInt(awayScore) : undefined,
        incidents,
        notes,
        yellowCards,
        redCards,
        status
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            competition: true
          }
        },
        referee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};