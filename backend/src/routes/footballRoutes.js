const express = require('express');
const {
    getLeagues,
    getSeasons,
    getTeams,
    getTeamStatistics,
    getTeamSeasons,
    getTeamCountries,
    getStandings,
    getFixturePlayers,
    getFixtures,
    getTopScorers,
    getSquad,
    getTransfers
} = require('../controllers/footballController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public endpoints
router.get('/leagues', getLeagues);
router.get('/seasons', getSeasons);
router.get('/teams', getTeams);
router.get('/teams/statistics', getTeamStatistics);
router.get('/teams/seasons', getTeamSeasons);
router.get('/teams/countries', getTeamCountries);
router.get('/standings', getStandings);
router.get('/fixtures/players', getFixturePlayers);
router.get('/fixtures', getFixtures);
router.get('/topscorers', getTopScorers);
router.get('/squad', getSquad);
router.get('/transfers', getTransfers);

// Protected endpoints for specific roles
router.get('/admin/leagues', auth, requireRole(['ADMIN', 'SECRETARIAT']), getLeagues);
router.get('/admin/seasons', auth, requireRole(['ADMIN', 'SECRETARIAT']), getSeasons);
router.get('/admin/teams', auth, requireRole(['ADMIN', 'SECRETARIAT']), getTeams);
router.get('/admin/teams/statistics', auth, requireRole(['ADMIN', 'SECRETARIAT']), getTeamStatistics);
router.get('/admin/teams/seasons', auth, requireRole(['ADMIN', 'SECRETARIAT']), getTeamSeasons);
router.get('/admin/teams/countries', auth, requireRole(['ADMIN', 'SECRETARIAT']), getTeamCountries);
router.get('/admin/standings', auth, requireRole(['ADMIN', 'SECRETARIAT']), getStandings);
router.get('/admin/fixtures/players', auth, requireRole(['ADMIN', 'SECRETARIAT']), getFixturePlayers);
router.get('/admin/fixtures', auth, requireRole(['ADMIN', 'SECRETARIAT']), getFixtures);
router.get('/admin/topscorers', auth, requireRole(['ADMIN', 'SECRETARIAT']), getTopScorers);
router.get('/admin/squad', auth, requireRole(['ADMIN', 'SECRETARIAT']), getSquad);
router.get('/admin/transfers', auth, requireRole(['ADMIN', 'SECRETARIAT']), getTransfers);

module.exports = router;