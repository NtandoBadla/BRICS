const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
    createReferee,
    getReferees,
    getRefereeById,
    updateReferee,
    deleteReferee,
    createDisciplinaryReport,
    getDisciplinaryReports,
    updateDisciplinaryReportStatus
} = require('../controllers/refereeController');

// --- Referee Registry Routes (Day 8) ---
router.post('/referees', auth, requireRole(['ADMIN']), createReferee);
router.put('/referees/:id', auth, requireRole(['ADMIN']), updateReferee);
router.delete('/referees/:id', auth, requireRole(['ADMIN']), deleteReferee);
router.get('/referees', auth, getReferees);
router.get('/referees/:id', auth, getRefereeById);

// --- Disciplinary Reporting Routes (Day 9) ---
router.post('/disciplinary-reports', auth, requireRole(['REFEREE']), createDisciplinaryReport);
router.get('/disciplinary-reports', auth, getDisciplinaryReports);


module.exports = router;