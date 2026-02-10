const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
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
} = require('../controllers/refereeController');

console.log('✅ Referee routes loaded');

// Referee Registry Routes
router.post('/', auth, requireRole(['ADMIN']), createReferee);
router.get('/', auth, getReferees);

// Disciplinary Report Routes (must be before /:id)
router.get('/reports/statistics', auth, requireRole(['FEDERATION_OFFICIAL', 'ADMIN']), getDisciplinaryStatistics);
router.post('/reports', auth, requireRole(['REFEREE']), createDisciplinaryReport);
router.get('/reports', auth, getDisciplinaryReports);
router.get('/reports/:id', auth, getDisciplinaryReportById);
router.put('/reports/:id', auth, requireRole(['REFEREE', 'SECRETARIAT']), updateDisciplinaryReport);
router.put('/reports/:id/approve', auth, requireRole(['SECRETARIAT', 'ADMIN']), approveDisciplinaryReport);

// Match Assignment Routes
router.post('/assignments', auth, requireRole(['ADMIN', 'SECRETARIAT']), createAssignment);
router.get('/assignments/all', auth, requireRole(['ADMIN', 'SECRETARIAT']), getAllAssignments);
router.put('/assignments/:id/accept', auth, requireRole(['REFEREE']), acceptAssignment);
router.put('/assignments/:id/decline', auth, requireRole(['REFEREE']), declineAssignment);

router.get('/:id', auth, getRefereeById);
router.put('/:id', auth, requireRole(['ADMIN', 'REFEREE']), updateReferee);
router.delete('/:id', auth, requireRole(['ADMIN']), deleteReferee);
router.put('/profile/change-password', auth, requireRole(['REFEREE']), changePassword);
router.get('/:id/assignments', auth, getRefereeAssignments);

console.log('✅ Referee routes registered');

module.exports = router;