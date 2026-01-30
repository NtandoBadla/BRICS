import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createNationalSquad, 
  getNationalSquads, 
  updateNationalSquad,
  getAvailableAthletes
} from '../controllers/nationalSquadController.js';

const router = express.Router();

router.use(authenticateToken);

// Test route
router.get('/test-squads', (req, res) => {
  res.json({ message: 'National squad routes working' });
});

router.post('/national-squads', createNationalSquad);
router.get('/national-squads', getNationalSquads);
router.put('/national-squads/:id', updateNationalSquad);
router.get('/athletes/available', getAvailableAthletes);

export default router;