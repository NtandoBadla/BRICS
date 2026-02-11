const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const { sendMatchAssignmentEmail } = require('../services/emailService');

// Referee Management
const createReferee = async (req, res) => {
  try {
    console.log('✅ Create referee endpoint hit');
    const { firstName, lastName, email, licenseNumber, certification, experience } = req.body;

    // Check if license number already exists
    const existingReferee = await prisma.referee.findUnique({
      where: { licenseNumber }
    });
    if (existingReferee) {
      return res.status(400).json({ error: 'License number already exists' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(licenseNumber, 10);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: 'REFEREE'
      }
    });

    const referee = await prisma.referee.create({
      data: {
        userId: user.id,
        licenseNumber,
        certification,
        experience: parseInt(experience) || 0,
        availability: {}
      },
      include: { user: true }
    });

    console.log('✅ Referee created:', referee.id);
    res.status(201).json(referee);
  } catch (error) {
    console.error('❌ Create referee error:', error.message);
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: error.message });
  }
};

const getReferees = async (req, res) => {
  try {
    const referees = await prisma.referee.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);
    
    console.log(`✅ Found ${referees.length} referees`);
    res.json(referees || []);
  } catch (error) {
    console.error('Get referees error:', error);
    res.json([]);
  }
};

const getRefereeById = async (req, res) => {
  try {
    const referee = await prisma.referee.findUnique({
      where: { id: req.params.id },
      include: { user: true, assignments: { include: { match: true } }, reports: true }
    });
    if (!referee) return res.status(404).json({ error: 'Referee not found' });
    res.json(referee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateReferee = async (req, res) => {
  try {
    const { licenseNumber, certification, experience, availability } = req.body;
    const referee = await prisma.referee.update({
      where: { id: req.params.id },
      data: { licenseNumber, certification, experience: parseInt(experience), availability },
      include: { user: true }
    });
    res.json(referee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReferee = async (req, res) => {
  try {
    await prisma.referee.delete({ where: { id: req.params.id } });
    res.json({ message: 'Referee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Match Assignments
const getRefereeAssignments = async (req, res) => {
  try {
    const assignments = await prisma.matchAssignment.findMany({
      where: { refereeId: req.params.id },
      include: { match: { include: { homeTeam: true, awayTeam: true, competition: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllAssignments = async (req, res) => {
  try {
    console.log('✅ Fetching all assignments');
    const assignments = await prisma.matchAssignment.findMany({
      include: {
        match: { include: { homeTeam: true, awayTeam: true, competition: true } },
        referee: { include: { user: true } }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => []);
    console.log(`✅ Found ${assignments.length} assignments`);
    res.json(assignments || []);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.json([]);
  }
};

const createAssignment = async (req, res) => {
  try {
    const { matchId, refereeId, role } = req.body;
    console.log('📝 Creating assignment:', { matchId, refereeId, role });
    
    const assignment = await prisma.matchAssignment.create({
      data: { matchId, refereeId, role, status: 'PENDING' },
      include: { 
        match: { 
          include: { 
            homeTeam: true, 
            awayTeam: true, 
            competition: true 
          } 
        }, 
        referee: { include: { user: true } } 
      }
    });

    console.log('✅ Assignment created:', assignment.id);

    // Send email notification
    try {
      const matchDate = new Date(assignment.match.scheduledAt);
      const emailResult = await sendMatchAssignmentEmail(
        assignment.referee.user.email,
        `${assignment.referee.user.firstName} ${assignment.referee.user.lastName}`,
        {
          homeTeam: assignment.match.homeTeam.name,
          awayTeam: assignment.match.awayTeam.name,
          date: matchDate.toLocaleDateString(),
          time: matchDate.toLocaleTimeString(),
          venue: assignment.match.venue,
          role: role
        }
      );
      console.log('📧 Email result:', emailResult);
    } catch (emailError) {
      console.error('⚠️ Email failed but assignment created:', emailError.message);
    }

    res.status(201).json(assignment);
  } catch (error) {
    console.error('❌ Create assignment error:', error);
    res.status(500).json({ error: error.message });
  }
};

const acceptAssignment = async (req, res) => {
  try {
    const assignment = await prisma.matchAssignment.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED' },
      include: { match: true }
    });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const declineAssignment = async (req, res) => {
  try {
    const assignment = await prisma.matchAssignment.update({
      where: { id: req.params.id },
      data: { status: 'DECLINED' },
      include: { match: true }
    });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Disciplinary Reports
const createDisciplinaryReport = async (req, res) => {
  try {
    console.log('📝 Creating disciplinary report:', req.body);
    const { matchId, refereeId, playerId, playerName, incident, action, minute, description } = req.body;
    
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      console.error('❌ Match not found:', matchId);
      return res.status(404).json({ error: 'Match not found' });
    }
    
    const referee = await prisma.referee.findUnique({ where: { id: refereeId } });
    if (!referee) {
      console.error('❌ Referee not found:', refereeId);
      return res.status(404).json({ error: 'Referee not found' });
    }
    
    if (playerId && playerId !== 'none') {
      const player = await prisma.athlete.findUnique({ 
        where: { id: playerId },
        select: { id: true, firstName: true, lastName: true }
      });
      if (!player) {
        console.error('❌ Player not found:', playerId);
        return res.status(404).json({ error: 'Player not found' });
      }
    }
    
    const report = await prisma.disciplinaryReport.create({
      data: {
        matchId,
        refereeId,
        playerId: (playerId && playerId !== 'none') ? playerId : null,
        playerName: playerName || null,
        incident,
        action,
        minute: minute ? parseInt(minute) : null,
        description,
        status: 'SUBMITTED'
      },
      include: { match: { include: { homeTeam: true, awayTeam: true } }, referee: { include: { user: true } }, player: true }
    });
    console.log('✅ Report created:', report.id);
    res.status(201).json(report);
  } catch (error) {
    console.error('❌ Create report error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getDisciplinaryReports = async (req, res) => {
  try {
    const { refereeId, status } = req.query;
    const where = {};
    if (refereeId) where.refereeId = refereeId;
    if (status) where.status = status;

    const reports = await prisma.disciplinaryReport.findMany({
      where,
      include: {
        match: { include: { homeTeam: true, awayTeam: true } },
        referee: { include: { user: true } },
        player: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDisciplinaryReportById = async (req, res) => {
  try {
    const report = await prisma.disciplinaryReport.findUnique({
      where: { id: req.params.id },
      include: {
        match: { include: { homeTeam: true, awayTeam: true } },
        referee: { include: { user: true } },
        player: true
      }
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDisciplinaryReport = async (req, res) => {
  try {
    const { incident, action, minute, description, status } = req.body;
    const report = await prisma.disciplinaryReport.update({
      where: { id: req.params.id },
      data: { incident, action, minute: minute ? parseInt(minute) : null, description, status },
      include: { match: true, referee: { include: { user: true } }, player: true }
    });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveDisciplinaryReport = async (req, res) => {
  try {
    const report = await prisma.disciplinaryReport.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' },
      include: { match: true, referee: { include: { user: true } }, player: true }
    });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Statistics
const getDisciplinaryStatistics = async (req, res) => {
  try {
    const stats = await prisma.disciplinaryReport.groupBy({
      by: ['action', 'status'],
      _count: { id: true }
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createReferee,
  getReferees,
  getRefereeById,
  updateReferee,
  deleteReferee,
  getRefereeAssignments,
  getAllAssignments,
  createAssignment,
  acceptAssignment,
  declineAssignment,
  createDisciplinaryReport,
  getDisciplinaryReports,
  getDisciplinaryReportById,
  updateDisciplinaryReport,
  approveDisciplinaryReport,
  getDisciplinaryStatistics,
  changePassword
};