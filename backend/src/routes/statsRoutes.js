import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  updateMatchResult, 
  getStandings, 
  getTopScorers,
  getMatches
} from '../controllers/statsController.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/matches/result', updateMatchResult);
router.get('/matches', getMatches);
router.get('/standings/:competitionId', getStandings);
router.get('/top-scorers', getTopScorers);

export default router;