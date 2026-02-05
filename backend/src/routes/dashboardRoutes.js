const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// Player/Athlete routes
router.get('/athlete/profile', authenticateToken, dashboardController.getAthleteProfile);
router.post('/athlete/transfer-request', authenticateToken, dashboardController.requestTransfer);
router.post('/athlete/agent-request', authenticateToken, dashboardController.requestAgentChange);
router.put('/athlete/agent-response', authenticateToken, dashboardController.respondToAgentOffer);

// Agent routes
router.get('/agent/:agentId/athletes', authenticateToken, dashboardController.getAgentAthletes);
router.get('/agent/:agentId/requests', authenticateToken, dashboardController.getAgentRequests);
router.get('/agent/search-athletes', authenticateToken, dashboardController.searchAthletes);
router.post('/agent/send-request', authenticateToken, dashboardController.sendAgentRequest);

// Coach routes
router.get('/coach/team/:teamId/athletes', authenticateToken, dashboardController.getTeamAthletes);
router.get('/coach/team/:teamId/stats', authenticateToken, dashboardController.getTeamStats);

// Notifications
router.get('/notifications/:userId', authenticateToken, dashboardController.getNotifications);
router.put('/notifications/:notificationId/read', authenticateToken, dashboardController.markNotificationRead);

// Admin/Team Manager routes
router.post('/athletes', authenticateToken, dashboardController.createAthlete);
router.get('/athletes', authenticateToken, dashboardController.getAllAthletes);

module.exports = router;