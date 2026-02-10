const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  createTeamRegistration,
  getTeamRegistrations,
  createDocument,
  getDocuments,
  approveDocument,
  rejectDocument,
  getAuditLogs,
  approveRefereeApplication
} = require('../controllers/governanceController');

// Team Registration
router.post('/teams/register', auth, requireRole(['TEAM_MANAGER', 'ADMIN']), createTeamRegistration);
router.get('/teams', auth, requireRole(['SECRETARIAT', 'ADMIN']), getTeamRegistrations);

// Document Management
router.post('/documents', auth, createDocument);
router.get('/documents', auth, getDocuments);
router.put('/documents/:id/approve', auth, requireRole(['SECRETARIAT', 'ADMIN']), approveDocument);
router.put('/documents/:id/reject', auth, requireRole(['SECRETARIAT', 'ADMIN']), rejectDocument);

// Audit Logs
router.get('/audit-logs', auth, requireRole(['ADMIN']), getAuditLogs);

// Referee Applications
router.put('/referees/:id/approve', auth, requireRole(['SECRETARIAT', 'ADMIN']), approveRefereeApplication);

module.exports = router;
