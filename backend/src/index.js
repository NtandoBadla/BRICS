const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Your local frontend
    `https://bifa-platform.vercel.app`, // Your production domain
    `https://${process.env.VERCEL_URL}`, // Vercel's dynamic preview URLs
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const prisma = new PrismaClient();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware to authorize based on user roles
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Permission denied. User role not found.' });
    }

    if (allowedRoles.includes(req.user.role)) {
      next(); // Role is allowed, proceed to the route handler
    } else {
      res.status(403).json({ error: 'Permission denied. You do not have the required privileges.' });
    }
  };
};

// Health check
app.get('/', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'disconnected';
    console.error('DB Health Check Failed:', e);
  }
  res.json({
    message: 'BIFA Backend API',
    status: 'running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    features: ['CMS', 'Governance', 'Referee Registry', 'Disciplinary Reports']
  });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  console.log('Register attempt:', req.body.email);
  try {
    const { email, password, firstName, lastName, role = 'TEAM_MANAGER' } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    let user;
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role,
          createdAt: new Date()
        }
      });
    } catch (dbError) {
      console.error('Database Error:', dbError);
      if (dbError.code === 'P2021') {
        return res.status(500).json({ error: 'Database tables not found. Please run migrations.' });
      }
      return res.status(500).json({ error: 'Database connection failed. Check server logs.' });
    }


    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      token
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    if (error.code === 'P2021') {
      return res.status(500).json({ error: 'Database tables not found. Please run migrations.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// CMS endpoints
app.get('/api/cms/pages', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const pages = await prisma.page.findMany({
      where: {
        language: language,
        status: 'PUBLISHED'
      }
    });
    res.json(pages);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    res.status(500).json({ error: 'Could not fetch pages' });
  }
});

// Create a new page (only for ADMINs)
app.post('/api/cms/pages', authenticateToken, authorize(['ADMIN']), async (req, res) => {
  try {
    const { title, slug, content, language = 'en', status = 'DRAFT' } = req.body;
    const newPage = await prisma.page.create({
      data: { title, slug, content, language, status }
    });
    res.status(201).json(newPage);
  } catch (error) {
    console.error('Failed to create page:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A page with this slug already exists.' });
    }
    res.status(500).json({ error: 'Could not create page' });
  }
});

app.get('/api/cms/news', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const newsArticles = await prisma.content.findMany({
      where: {
        type: 'NEWS',
        status: 'PUBLISHED',
        language: language
      },
      include: {
        author: {
          select: { firstName: true, lastName: true }
        }
      }
    });
    res.json({ data: newsArticles });
  } catch (error) {
    console.error('Failed to fetch news:', error);
    res.status(500).json({ error: 'Could not fetch news' });
  }
});

// Legacy endpoints
app.get('/api/competitions', (req, res) => {
  res.json([
    { id: 1, name: 'BRICS Cup 2024', season: '2024', teams: [] },
    { id: 2, name: 'Championship League', season: '2024', teams: [] }
  ]);
});

app.get('/api/competitions/matches', (req, res) => {
  res.json([
    {
      id: 1,
      homeTeam: 'Brazil',
      homeTeamLogo: 'https://placehold.co/60x60/png?text=BRA',
      awayTeam: 'Russia',
      awayTeamLogo: 'https://placehold.co/60x60/png?text=RUS',
      date: '2024-02-15',
      time: '15:00',
      venue: 'Stadium A'
    },
    {
      id: 2,
      homeTeam: 'India',
      homeTeamLogo: 'https://placehold.co/60x60/png?text=IND',
      awayTeam: 'China',
      awayTeamLogo: 'https://placehold.co/60x60/png?text=CHN',
      date: '2024-02-16',
      time: '18:00',
      venue: 'Stadium B'
    }
  ]);
});

// Admin Dashboard Endpoints
// Get all users (only for ADMINs)
app.get('/api/users', authenticateToken, authorize(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Fetch Users Error:', error);
    if (error.code === 'P2021') {
      return res.status(500).json({ error: 'Database tables not found. Please run migrations.' });
    }
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/football/leagues', (req, res) => {
  res.json({
    response: [
      { league: { id: 1, name: 'Premier League', type: 'League' }, country: { name: 'England' } },
      { league: { id: 2, name: 'La Liga', type: 'League' }, country: { name: 'Spain' } },
      { league: { id: 3, name: 'Bundesliga', type: 'League' }, country: { name: 'Germany' } }
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 BIFA Backend running on http://localhost:${PORT}`);
    console.log('✅ Features: CMS, Auth (simplified for testing)');
  });
}

module.exports = app;