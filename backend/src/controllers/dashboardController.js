const prisma = require('../prisma');

// Get athlete profile for player dashboard
const getAthleteProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find user and their athlete record
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find athlete by matching name and email
    const athlete = await prisma.athlete.findFirst({
      where: {
        firstName: user.firstName,
        lastName: user.lastName
      },
      include: {
        team: true,
        agent: true,
        matchEvents: true,
        transferRequests: true,
        agentRequests: true
      }
    });

    if (!athlete) {
      return res.status(404).json({ error: 'Athlete profile not found' });
    }

    res.json(athlete);
  } catch (error) {
    console.error('Get athlete profile error:', error);
    res.status(500).json({ error: 'Failed to fetch athlete profile' });
  }
};

const requestTransfer = async (req, res) => {
  try {
    const { teamId, message } = req.body;
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const athlete = await prisma.athlete.findFirst({
      where: { firstName: user.firstName, lastName: user.lastName }
    });

    const transfer = await prisma.transferRequest.create({
      data: { athleteId: athlete.id, requestedTeamId: teamId, message, status: 'PENDING' }
    });

    res.json(transfer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to request transfer' });
  }
};

const requestAgentChange = async (req, res) => {
  try {
    const { agentId, message } = req.body;
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const athlete = await prisma.athlete.findFirst({
      where: { firstName: user.firstName, lastName: user.lastName }
    });

    const request = await prisma.agentRequest.create({
      data: { athleteId: athlete.id, agentId, message, status: 'PENDING' }
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to request agent change' });
  }
};

const respondToAgentOffer = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    
    const request = await prisma.agentRequest.update({
      where: { id: requestId },
      data: { status }
    });

    if (status === 'ACCEPTED') {
      await prisma.athlete.update({
        where: { id: request.athleteId },
        data: { agentId: request.agentId }
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to agent offer' });
  }
};

const getAgentAthletes = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const athletes = await prisma.athlete.findMany({
      where: { agentId },
      include: { team: true, matchEvents: true }
    });

    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
};

const getAgentRequests = async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const requests = await prisma.agentRequest.findMany({
      where: { agentId },
      include: { athlete: { include: { team: true } } }
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

const searchAthletes = async (req, res) => {
  try {
    const { search } = req.query;
    
    const athletes = await prisma.athlete.findMany({
      where: {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } }
        ]
      },
      include: { team: true, agent: true }
    });

    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search athletes' });
  }
};

const sendAgentRequest = async (req, res) => {
  try {
    const { athleteId, message } = req.body;
    const userId = req.user.userId;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const agent = await prisma.agent.findFirst({
      where: { firstName: user.firstName, lastName: user.lastName }
    });

    const request = await prisma.agentRequest.create({
      data: { athleteId, agentId: agent.id, message, status: 'PENDING' }
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send agent request' });
  }
};

const getTeamAthletes = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const athletes = await prisma.athlete.findMany({
      where: { teamId },
      include: { agent: true, matchEvents: true }
    });

    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team athletes' });
  }
};

const getTeamStats = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        athletes: { include: { matchEvents: true } },
        homeMatches: true,
        awayMatches: true
      }
    });

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team stats' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

const createAthlete = async (req, res) => {
  try {
    const athlete = await prisma.athlete.create({
      data: req.body
    });

    res.json(athlete);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create athlete' });
  }
};

const getAllAthletes = async (req, res) => {
  try {
    const athletes = await prisma.athlete.findMany({
      include: { team: true, agent: true }
    });

    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
};

module.exports = {
  getAthleteProfile,
  requestTransfer,
  requestAgentChange,
  respondToAgentOffer,
  getAgentAthletes,
  getAgentRequests,
  searchAthletes,
  sendAgentRequest,
  getTeamAthletes,
  getTeamStats,
  getNotifications,
  markNotificationRead,
  createAthlete,
  getAllAthletes
};