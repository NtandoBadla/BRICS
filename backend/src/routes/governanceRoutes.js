const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const governanceController = require('../controllers/governanceController');

// Destructure controller functions
const {
  createDocument,
  getDocuments,
  approveDocument,
  createTask,
  getTasks,
  updateTaskStatus
} = governanceController;

// Debug check to prevent "argument handler must be a function" error
if (!createDocument || !auth) {
  console.error('❌ Error: Missing imports in governanceRoutes. Check governanceController exports.');
}

// Document routes
router.post('/documents', auth, requireRole(['ADMIN', 'SECRETARIAT']), createDocument);
router.get('/documents', auth, getDocuments);
router.put('/documents/:id/approve', auth, requireRole(['ADMIN', 'SECRETARIAT']), approveDocument);

// Task routes
router.post('/tasks', auth, requireRole(['ADMIN', 'SECRETARIAT']), createTask);
router.get('/tasks', auth, getTasks);
router.put('/tasks/:id/status', auth, requireRole(['ADMIN', 'SECRETARIAT']), updateTaskStatus);

module.exports = router;