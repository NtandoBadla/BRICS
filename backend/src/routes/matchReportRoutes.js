const express = require('express');
const { createMatchReport, getMatchReports, getMatchReportById, updateMatchReport } = require('../controllers/matchReportController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Referee routes
router.post('/', auth, requireRole(['REFEREE', 'ADMIN']), createMatchReport);
router.put('/:id', auth, requireRole(['REFEREE', 'ADMIN']), updateMatchReport);

// Admin and Secretariat routes
router.get('/', auth, requireRole(['ADMIN', 'SECRETARIAT']), getMatchReports);
router.get('/:id', auth, requireRole(['ADMIN', 'SECRETARIAT', 'REFEREE']), getMatchReportById);

module.exports = router;