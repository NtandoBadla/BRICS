const express = require('express');
const { createMatch, getMatches, getMatchById, updateMatch, deleteMatch, assignReferee, getMatchAssignments } = require('../controllers/matchController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getMatches);
router.get('/:id', getMatchById);

// Protected routes
router.post('/', auth, requireRole(['ADMIN', 'SECRETARIAT']), createMatch);
router.put('/:id', auth, requireRole(['ADMIN', 'SECRETARIAT', 'REFEREE']), updateMatch);
router.delete('/:id', auth, requireRole(['ADMIN']), deleteMatch);
router.post('/assign-referee', auth, requireRole(['ADMIN', 'SECRETARIAT']), assignReferee);
router.get('/:matchId/assignments', auth, getMatchAssignments);

module.exports = router;
