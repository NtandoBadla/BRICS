const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'BIFA Backend API', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API endpoints
app.get('/api/competitions', (req, res) => {
  res.json([
    { id: 1, name: 'BRICS Cup 2024', season: '2024', teams: [] },
    { id: 2, name: 'Championship League', season: '2024', teams: [] }
  ]);
});

app.get('/api/competitions/matches', (req, res) => {
  res.json([
    { id: 1, homeTeam: 'Brazil', awayTeam: 'Russia', date: '2024-02-15', time: '15:00', venue: 'Stadium A' },
    { id: 2, homeTeam: 'India', awayTeam: 'China', date: '2024-02-16', time: '18:00', venue: 'Stadium B' }
  ]);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@bifa.com' && password === 'admin123') {
    res.json({
      token: 'mock-jwt-token',
      user: {
        id: 1,
        email: 'admin@bifa.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/football/teams', (req, res) => {
  res.json([
    { id: 1, name: 'Brazil National Team', league: 'International' },
    { id: 2, name: 'Argentina National Team', league: 'International' }
  ]);
});

module.exports = app;