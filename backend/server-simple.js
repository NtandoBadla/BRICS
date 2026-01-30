const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const { footballApi } = require('./src/services/footballApi');

const app = express();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(cors({
  origin: ['http://localhost:3000', /\.vercel\.app$/],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: "BIFA Backend API", 
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Admin login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Try Supabase first
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      // Fallback: hardcoded admin for testing
      if (email.toLowerCase() === 'admin@bifa.com' && password === 'admin123') {
        const token = jwt.sign(
          { userId: 'admin-1', email: 'admin@bifa.com', role: 'ADMIN' },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return res.json({
          message: 'Login successful',
          user: {
            id: 'admin-1',
            email: 'admin@bifa.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN'
          },
          redirectUrl: '/admin',
          token
        });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, data.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: data.id, email: data.email, role: data.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      },
      redirectUrl: data.role === 'ADMIN' ? '/admin' : '/',
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Football API endpoints
app.get('/api/football/fixtures', async (req, res) => {
  try {
    const { league = '39', season = '2024' } = req.query;
    console.log(`Fetching fixtures for league ${league}, season ${season}`);
    
    const data = await footballApi.getFixtures(league, season);
    res.json(data);
  } catch (error) {
    console.error('Fixtures error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/football/transfers', async (req, res) => {
  try {
    const { team = '33' } = req.query;
    console.log(`Fetching transfers for team ${team}`);
    
    const data = await footballApi.getTransfers(team);
    res.json(data);
  } catch (error) {
    console.error('Transfers error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/football/topscorers', async (req, res) => {
  try {
    const { league = '39', season = '2024' } = req.query;
    console.log(`Fetching top scorers for league ${league}, season ${season}`);
    
    const data = await footballApi.getTopScorers(league, season);
    res.json(data);
  } catch (error) {
    console.error('Top scorers error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BIFA Backend running on http://localhost:${PORT}`);
  console.log(`🔑 Football API Key: ${process.env.FOOTBALL_API_KEY ? 'SET' : 'NOT SET'}`);
});