const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', /\.vercel\.app$/],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: "BIFA Backend API (Fallback Mode)", 
    status: "running",
    database: "offline",
    timestamp: new Date().toISOString()
  });
});

// Mock football API endpoints
app.get('/api/football/fixtures', (req, res) => {
  res.json({
    response: [
      {
        fixture: { date: '2024-02-15T15:00:00Z' },
        league: { name: 'BRICS Championship' },
        teams: {
          home: { name: 'Brazil', logo: 'https://placehold.co/40x40/png?text=BRA' },
          away: { name: 'Russia', logo: 'https://placehold.co/40x40/png?text=RUS' }
        }
      }
    ]
  });
});

app.get('/api/football/transfers', (req, res) => {
  res.json({
    response: [
      {
        player: { name: 'João Silva', photo: 'https://placehold.co/48x48/png?text=JS' },
        transfers: [{
          teams: { out: { name: 'São Paulo' }, in: { name: 'Flamengo' } },
          date: '2024-01-15'
        }]
      }
    ]
  });
});

app.get('/api/football/topscorers', (req, res) => {
  res.json({
    response: [
      {
        player: { name: 'Neymar Jr', photo: 'https://placehold.co/48x48/png?text=NJ' },
        statistics: [{ team: { name: 'Brazil NT' }, goals: { total: 15 } }]
      }
    ]
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    token: 'mock-fallback-token',
    user: {
      id: 1,
      email: req.body.email,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 BIFA Fallback Server running on http://localhost:${PORT}`);
});