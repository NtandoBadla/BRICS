import express from 'express';
const { testMatchAssignmentEmail } = require('../controllers/testEmailController');

const router = express.Router();

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is running!', 
    timestamp: new Date().toISOString(),
    endpoints: {
      football: '/api/football/*',
      auth: '/api/auth/*',
      users: '/api/users'
    }
  });
});

// Test email endpoint
router.get('/test-email', testMatchAssignmentEmail);

export default router;