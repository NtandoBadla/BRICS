const prisma = require('../prisma');

// --- Referee Registry ---

// @desc    Get all referees
// @route   GET /api/referees
// @access  Private
const getReferees = async (req, res) => {
    try {
        const referees = await prisma.referee.findMany({
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true }
                }
            }
        });
        res.json(referees);
    } catch (error) {
        console.error('Failed to fetch referees:', error);
        res.status(500).json({ error: 'Could not fetch referees' });
    }
};

// @desc    Get a single referee by ID
// @route   GET /api/referees/:id
// @access  Private
const getRefereeById = async (req, res) => {
    try {
        const { id } = req.params;
        const referee = await prisma.referee.findUnique({
            where: { id },
            include: {
                user: true,
                assignments: true,
                reports: true,
            }
        });

        if (!referee) {
            return res.status(404).json({ error: 'Referee not found' });
        }
        res.json(referee);
    } catch (error) {
        console.error(`Failed to fetch referee ${req.params.id}:`, error);
        res.status(500).json({ error: 'Could not fetch referee' });
    }
};

// @desc    Create a new referee profile
// @route   POST /api/referees
// @access  Private (Admin)
const createReferee = async (req, res) => {
    const { userId, licenseNumber, certification, experience } = req.body;
    if (!userId || !licenseNumber || !certification) {
        return res.status(400).json({ error: 'User ID, license number, and certification are required.' });
    }

    try {
        // Check if user exists and is not already a referee
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User to be promoted to referee not found.' });
        }

        const existingReferee = await prisma.referee.findFirst({ where: { OR: [{ userId }, { licenseNumber }] } });
        if (existingReferee) {
            return res.status(400).json({ error: 'User is already a referee or license number is taken.' });
        }

        const newReferee = await prisma.referee.create({
            data: {
                userId,
                licenseNumber,
                certification,
                experience: experience || 0,
                availability: {}, // Default empty availability
            }
        });

        // Also update the user's role
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'REFEREE' }
        });

        res.status(201).json(newReferee);
    } catch (error) {
        console.error('Failed to create referee:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A referee with this User ID or License Number already exists.' });
        }
        res.status(500).json({ error: 'Could not create referee profile.' });
    }
};

// @desc    Update a referee profile
// @route   PUT /api/referees/:id
// @access  Private (Admin)
const updateReferee = async (req, res) => {
    const { id } = req.params;
    const { licenseNumber, certification, experience, availability } = req.body;

    try {
        const updatedReferee = await prisma.referee.update({
            where: { id },
            data: {
                licenseNumber,
                certification,
                experience,
                availability
            }
        });
        res.json(updatedReferee);
    } catch (error) {
        console.error(`Failed to update referee ${id}:`, error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Referee not found.' });
        }
        res.status(500).json({ error: 'Could not update referee profile.' });
    }
};

// @desc    Delete a referee profile
// @route   DELETE /api/referees/:id
// @access  Private (Admin)
const deleteReferee = async (req, res) => {
    const { id } = req.params;
    try {
        const referee = await prisma.referee.findUnique({ where: { id } });
        if (!referee) {
            return res.status(404).json({ error: 'Referee not found.' });
        }

        await prisma.user.update({
            where: { id: referee.userId },
            data: { role: 'TEAM_MANAGER' } // Revert user role
        });

        await prisma.referee.delete({ where: { id } });

        res.status(204).send();
    } catch (error) {
        console.error(`Failed to delete referee ${id}:`, error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Referee not found.' });
        }
        res.status(500).json({ error: 'Could not delete referee profile.' });
    }
};


// --- Disciplinary Reports ---

// @desc    Create a new disciplinary report
// @route   POST /api/disciplinary-reports
// @access  Private (Referee)
const createDisciplinaryReport = async (req, res) => {
    const { matchId, playerId, incident, action, minute, description } = req.body;

    try {
        const refereeProfile = await prisma.referee.findUnique({ where: { userId: req.user.userId } });
        if (!refereeProfile) {
            return res.status(403).json({ error: 'User is not a registered referee.' });
        }

        const newReport = await prisma.disciplinaryReport.create({
            data: {
                matchId,
                refereeId: refereeProfile.id,
                playerId,
                incident,
                action,
                minute,
                description,
                status: 'SUBMITTED'
            }
        });
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Failed to create disciplinary report:', error);
        res.status(500).json({ error: 'Could not create report.' });
    }
};

// @desc    Get disciplinary reports (filtered by role)
// @route   GET /api/disciplinary-reports
// @access  Private (Admin, Secretariat, Referee)
const getDisciplinaryReports = async (req, res) => {
    const { role, userId } = req.user;
    let whereClause = {};

    try {
        if (role === 'REFEREE') {
            const refereeProfile = await prisma.referee.findUnique({ where: { userId } });
            whereClause = refereeProfile ? { refereeId: refereeProfile.id } : { refereeId: null }; // Prevent error
        }

        const reports = await prisma.disciplinaryReport.findMany({
            where: whereClause,
            include: {
                referee: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        console.error('Failed to fetch disciplinary reports:', error);
        res.status(500).json({ error: 'Could not fetch reports.' });
    }
};

module.exports = {
    createReferee,
    getReferees,
    getRefereeById,
    updateReferee,
    deleteReferee,
    createDisciplinaryReport,
    getDisciplinaryReports,
};