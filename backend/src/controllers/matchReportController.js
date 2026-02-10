const prisma = require('../prisma');

const createMatchReport = async (req, res) => {
  try {
    const { matchId, incidentType, description, playersInvolved, severity } = req.body;
    const refereeId = req.user.id;

    const report = await prisma.disciplinaryReport.create({
      data: {
        matchId,
        refereeId,
        incidentType,
        description,
        playersInvolved: playersInvolved || [],
        severity: severity || 'MEDIUM',
        status: 'PENDING'
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
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: error.message });
  }
};

const getMatchReports = async (req, res) => {
  try {
    const { status, refereeId } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (refereeId) where.refereeId = refereeId;

    const reports = await prisma.disciplinaryReport.findMany({
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
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message });
  }
};

const getMatchReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.disciplinaryReport.findUnique({
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
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
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

const updateMatchReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { incidentType, description, playersInvolved, severity, status } = req.body;

    const report = await prisma.disciplinaryReport.update({
      where: { id },
      data: {
        incidentType,
        description,
        playersInvolved,
        severity,
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
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMatchReport,
  getMatchReports,
  getMatchReportById,
  updateMatchReport
};