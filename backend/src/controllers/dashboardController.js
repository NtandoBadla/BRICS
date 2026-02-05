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

module.exports = {
  getAthleteProfile
};