import express from 'express';
import { createMatchReport, getMatchReports, getMatchReportById, updateMatchReport } from '../controllers/matchReportController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Referee routes
router.post('/', authenticateToken, requireRole('REFEREE', 'ADMIN'), createMatchReport);
router.put('/:id', authenticateToken, requireRole('REFEREE', 'ADMIN'), updateMatchReport);

// Admin routes
router.get('/', authenticateToken, requireRole('ADMIN', 'SECRETARIAT'), getMatchReports);
router.get('/:id', authenticateToken, requireRole('ADMIN', 'SECRETARIAT', 'REFEREE'), getMatchReportById);

export default router;