const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not defined in environment variables. Login will fail.');
}

const { auth, requireRole } = require('./middleware/auth');
const refereeRoutes = require('./routes/refereeRoutes');
const governanceRoutes = require('./routes/governanceRoutes');
const footballRoutes = require('./routes/footballRoutes');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost and any Vercel deployment
    if (origin.includes('localhost') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    console.log('Blocked by CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const prisma = require('./prisma');

// Check database connection on startup
prisma.$connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((e) => {
    console.error('❌ Database connection failed:', e.message);
    if (e.message.includes('6543')) {
      console.error('💡 TIP: Port 6543 might be blocked. Try using port 5432 in your .env file for local development.');
    }
    if (e.message.includes('Can\'t reach database server')) {
      console.error('💡 TIP: Check your hostname. For port 5432, use "db.[project-ref].supabase.co" instead of the pooler URL.');
    }
  });

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

    // Validate role to ensure it matches the database Enum
    const validRoles = ['ADMIN', 'SECRETARIAT', 'REFEREE', 'TEAM_MANAGER', 'FEDERATION_OFFICIAL'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    let user;
    try {
      const normalizedEmail = email.toLowerCase();
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          firstName,
          lastName,
          role,
        }
      });
      console.log(`✅ User registered in database: ${user.email} (${user.role})`);
    } catch (dbError) {
      console.error('Database Error:', dbError);
      if (dbError.code === 'P2021') {
        return res.status(500).json({ error: 'Database tables not found. Please run migrations.' });
      }
      return res.status(500).json({ error: `Database error: ${dbError.message}` });
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
    res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
});

// Support both /api/auth/login and /api/login for convenience
app.post(['/api/auth/login', '/api/login'], async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      console.log(`Login failed: User not found for email ${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`Login failed: Invalid password for user ${normalizedEmail}`);
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
    res.status(500).json({ error: `Login failed: ${error.message}` });
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
app.post('/api/cms/pages', auth, requireRole(['ADMIN']), async (req, res) => {
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
app.get('/api/users', auth, requireRole(['ADMIN', 'SECRETARIAT', 'FEDERATION_OFFICIAL']), async (req, res) => {
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

// Get system stats (only for ADMINs)
app.get('/api/admin/stats', auth, requireRole(['ADMIN', 'SECRETARIAT', 'FEDERATION_OFFICIAL']), async (req, res) => {
  try {
    const [users, referees, documents, reports] = await Promise.all([
      prisma.user.count(),
      prisma.referee.count(),
      prisma.document.count(),
      prisma.disciplinaryReport.count()
    ]);
    res.json({ users, referees, documents, reports });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Role-specific Dashboard Endpoints (to ensure all users can access a dashboard)
app.get('/api/secretariat/dashboard', auth, requireRole(['SECRETARIAT', 'ADMIN']), (req, res) => {
  res.json({ message: "Secretariat Dashboard", user: req.user, status: 'active' });
});

app.get('/api/referee/dashboard', auth, requireRole(['REFEREE', 'ADMIN']), (req, res) => {
  res.json({ message: "Referee Dashboard", user: req.user, status: 'active' });
});

app.get('/api/team-manager/dashboard', auth, requireRole(['TEAM_MANAGER', 'ADMIN']), (req, res) => {
  res.json({ message: "Team Manager Dashboard", user: req.user, status: 'active' });
});

app.get('/api/federation/dashboard', auth, requireRole(['FEDERATION_OFFICIAL', 'ADMIN']), (req, res) => {
  res.json({ message: "Federation Dashboard", user: req.user, status: 'active' });
});

// Feature Routes
app.use('/api', refereeRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/football', footballRoutes);

// 404 Handler for unmatched routes
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 BIFA Backend running on http://localhost:${PORT}`);
    console.log('✅ Features: CMS, Auth (simplified for testing)');
  });
}

module.exports = app;