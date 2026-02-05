const express = require('express');
const {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
  getCompetitionStandings,
  createMatch,
  getMatches,
  getMatchById,
  updateMatch,
  deleteMatch,
  getLiveMatches,
  createMatchEvent,
  getMatchEvents,
  createMatchStatistics,
  getMatchStatistics,
  updateMatchScore
} = require('../controllers/competitionController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Competition Management
router.post('/competitions', auth, requireRole(['ADMIN', 'SECRETARIAT']), createCompetition);
router.get('/competitions', getCompetitions); // Public
router.get('/competitions/:id', getCompetitionById); // Public
router.put('/competitions/:id', auth, requireRole(['ADMIN', 'SECRETARIAT']), updateCompetition);
router.delete('/competitions/:id', auth, requireRole(['ADMIN']), deleteCompetition);
router.get('/competitions/:id/standings', getCompetitionStandings); // Public

// Match Management
router.post('/matches', auth, requireRole(['ADMIN', 'SECRETARIAT']), createMatch);
router.get('/matches', getMatches); // Public
router.get('/matches/:id', getMatchById); // Public
router.put('/matches/:id', auth, requireRole(['ADMIN', 'SECRETARIAT', 'REFEREE']), updateMatch);
router.delete('/matches/:id', auth, requireRole(['ADMIN']), deleteMatch);
router.get('/matches/live', getLiveMatches); // Public

// Match Events & Statistics
router.post('/matches/:id/events', auth, requireRole(['REFEREE', 'ADMIN']), createMatchEvent);
router.get('/matches/:id/events', getMatchEvents); // Public
router.post('/matches/:id/statistics', auth, requireRole(['REFEREE', 'ADMIN']), createMatchStatistics);
router.get('/matches/:id/statistics', getMatchStatistics); // Public
router.put('/matches/:id/score', auth, requireRole(['REFEREE', 'ADMIN']), updateMatchScore);

module.exports = router;