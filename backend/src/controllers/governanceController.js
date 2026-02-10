const prisma = require('../prisma');

// Team Registration
const createTeamRegistration = async (req, res) => {
  try {
    const { teamName, federation, country, documents } = req.body;
    
    const team = await prisma.team.create({
      data: { name: teamName, federation, country }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'CREATE_TEAM',
        entityType: 'Team',
        entityId: team.id,
        newValues: { teamName, federation, country }
      }
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTeamRegistrations = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: { users: true, athletes: true }
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Document Management
const createDocument = async (req, res) => {
  try {
    const { name, type, content, entityType, entityId } = req.body;
    
    const document = await prisma.document.create({
      data: {
        name,
        type,
        content,
        entityType,
        entityId,
        createdBy: req.user.userId,
        status: 'DRAFT'
      }
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const documents = await prisma.document.findMany({
      where,
      include: { creator: true, approver: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: req.user.userId
      },
      include: { creator: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'APPROVE_DOCUMENT',
        entityType: 'Document',
        entityId: id,
        newValues: { status: 'APPROVED' }
      }
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const document = await prisma.document.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'REJECT_DOCUMENT',
        entityType: 'Document',
        entityId: id,
        newValues: { status: 'REJECTED', reason }
      }
    });

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Audit Logs
const getAuditLogs = async (req, res) => {
  try {
    const { entityType, userId } = req.query;
    const where = {};
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;

    const logs = await prisma.auditLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Referee Applications
const approveRefereeApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'APPROVE_REFEREE',
        entityType: 'Referee',
        entityId: id,
        newValues: { status: 'APPROVED' }
      }
    });

    res.json({ message: 'Referee approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTeamRegistration,
  getTeamRegistrations,
  createDocument,
  getDocuments,
  approveDocument,
  rejectDocument,
  getAuditLogs,
  approveRefereeApplication
};
