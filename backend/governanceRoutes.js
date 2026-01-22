const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
    createDocument,
    getDocuments,
    approveDocument,
    createTask,
    getTasks,
    updateTaskStatus,
} = require('../controllers/governanceController');

// --- Document Management Routes (Day 7) ---
router.post('/documents', auth, requireRole(['ADMIN', 'SECRETARIAT']), createDocument);
router.get('/documents', auth, getDocuments);
router.put('/documents/:id/approve', auth, requireRole(['ADMIN', 'SECRETARIAT']), approveDocument);

// --- Secretariat Workflow / Task Routes (Day 7) ---
router.post('/tasks', auth, requireRole(['ADMIN', 'SECRETARIAT']), createTask);
router.get('/tasks', auth, getTasks);

module.exports = router;