import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createPlayer, 
  getTeamPlayers, 
  updatePlayer, 
  deletePlayer 
} from '../controllers/playerController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new player (team managers only)
router.post('/players', createPlayer);

// Get all players for manager's team
router.get('/players', getTeamPlayers);

// Update a player
router.put('/players/:id', updatePlayer);

// Delete a player
router.delete('/players/:id', deletePlayer);

export default router;