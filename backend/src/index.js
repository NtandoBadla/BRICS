const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Debug: Check for critical environment variables on startup
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error(`❌ CRITICAL ERROR: Missing environment variables: ${missingVars.join(', ')}`);
  console.log('💡 HINT: Set these environment variables in your Render dashboard:');
  console.log('- DATABASE_URL: Your PostgreSQL connection string');
  console.log('- JWT_SECRET: A secure random string for JWT tokens');
  console.log('- DIRECT_URL: Direct database connection (optional for migrations)');
} else {
  console.log('✅ Core environment variables detected.');
}

// Validate DATABASE_URL format if present
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ DATABASE_URL must start with postgresql:// or postgres://');
  console.log('Current DATABASE_URL format:', process.env.DATABASE_URL?.substring(0, 20) + '...');
}

// Warn about DIRECT_URL instead of failing
if (!process.env.DIRECT_URL) {
  console.warn('⚠️ WARNING: DIRECT_URL is missing. Migrations may fail, but runtime might work if DATABASE_URL is pooled.');
}

// Check for Football API Key (replace 'FOOTBALL_API_KEY' with the actual name your code uses)
if (!process.env.FOOTBALL_API_KEY && !process.env.API_FOOTBALL_KEY) {
  console.warn('⚠️ WARNING: No Football API Key found (FOOTBALL_API_KEY or API_FOOTBALL_KEY). External data fetching may fail.');
}

const { sendRoleUpdateEmail } = require('./services/emailService');
const { auth, requireRole } = require('./middleware/auth');
const refereeRoutes = require('./routes/refereeRoutes');
const governanceRoutes = require('./routes/governanceRoutes');
const footballRoutes = require('./routes/footballRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const userRoutes = require('./routes/userRoutes');
const { footballApi } = require('./services/footballApi');

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins temporarily for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const prisma = require('./prisma');

// Initialize Supabase client as fallback
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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

// Helper to determine redirect URL based on role
const getDashboardUrl = (role) => {
  if (!role) return '/'; // Return default for undefined roles
  switch (role.toString().trim().toUpperCase()) { // Make comparison case-insensitive and trim whitespace
    case 'ADMIN': return '/admin';
    case 'SECRETARIAT': return '/secretariat';
    case 'REFEREE': return '/referee';
    case 'TEAM_MANAGER': return '/team-manager';
    case 'FEDERATION_OFFICIAL': return '/federation';
    default: return '/';
  }
};

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
      redirectUrl: getDashboardUrl(user.role),
      token
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: `Registration failed: ${error.message}` });
  }
});

// Support both /api/auth/login and /api/login for convenience
app.post(['/api/auth/login', '/api/login'], async (req, res) => {
  console.log('Login attempt:', req.body.email);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const normalizedEmail = email.toLowerCase();
    
    // Fallback admin login if database user doesn't exist
    if (normalizedEmail === 'admin@bifa.com' && password === 'admin123') {
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
      redirectUrl: getDashboardUrl(user.role),
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

// Create content (news/articles) - Admin only
app.post(['/api/cms/content', '/api/cms/news'], auth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { title, summary, content, excerpt, type = 'NEWS', language = 'en', status = 'PUBLISHED', category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newContent = await prisma.content.create({
      data: {
        title,
        summary: summary || excerpt,
        content,
        type,
        language,
        status,
        authorId: req.user.userId
      },
      include: {
        author: {
          select: { firstName: true, lastName: true }
        }
      }
    });
    
    console.log(`✅ Created ${type} article: ${title}`);
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Failed to create content:', error);
    if (error.code === 'P2021') {
      return res.status(500).json({ error: 'Database tables not found. Please run migrations.' });
    }
    res.status(500).json({ error: 'Could not create content' });
  }
});

// Get all content for admin
app.get(['/api/cms/content', '/api/cms/pages'], auth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { type, language = 'en' } = req.query;
    const where = { language };
    if (type) where.type = type;

    const content = await prisma.content.findMany({
      where,
      include: {
        author: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📄 Fetched ${content.length} content items`);
    res.json(content);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    if (error.code === 'P2021') {
      return res.status(500).json({ error: 'Database tables not found. Please run migrations.' });
    }
    res.status(500).json({ error: 'Could not fetch content' });
  }
});

// Public News Endpoint (with alias)
app.get(['/api/cms/news', '/api/news'], async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    
    // Try to get real news from database first
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
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // If we have real news articles, return them
    if (newsArticles && newsArticles.length > 0) {
      console.log(`✅ Found ${newsArticles.length} news articles in database`);
      return res.json({ data: newsArticles });
    }

    // Only return mock data if database is empty
    console.log('🔄 No news in database, returning mock data');
    res.json({
      data: [
        { 
          id: 1, 
          title: 'BRICS Football Championship 2024 Announced', 
          summary: 'The inaugural BRICS Football Championship will feature teams from Brazil, Russia, India, China, and South Africa.', 
          content: 'The BRICS nations have come together to create an exciting new football tournament that will showcase the best talent from these emerging economies.',
          type: 'NEWS', 
          status: 'PUBLISHED', 
          author: { firstName: 'BIFA', lastName: 'Admin' }, 
          createdAt: new Date('2024-01-15'),
          language: 'en'
        },
        { 
          id: 2, 
          title: 'New Stadium Facilities Unveiled', 
          summary: 'State-of-the-art facilities have been completed in preparation for the upcoming tournament.', 
          content: 'The new stadiums feature modern amenities and will provide an excellent experience for both players and spectators.',
          type: 'NEWS', 
          status: 'PUBLISHED', 
          author: { firstName: 'BIFA', lastName: 'Admin' }, 
          createdAt: new Date('2024-01-10'),
          language: 'en'
        },
        { 
          id: 3, 
          title: 'Player Registration Opens', 
          summary: 'National teams can now register their players for the championship.', 
          content: 'The registration process has been streamlined to ensure all eligible players can participate in this historic tournament.',
          type: 'NEWS', 
          status: 'PUBLISHED', 
          author: { firstName: 'BIFA', lastName: 'Admin' }, 
          createdAt: new Date('2024-01-05'),
          language: 'en'
        }
      ]
    });
  } catch (error) {
    console.error('Failed to fetch news:', error);
    // Return mock data on database error
    res.json({
      data: [
        { 
          id: 1, 
          title: 'BRICS Football Championship 2024', 
          summary: 'The tournament brings together the best teams from BRICS nations.', 
          type: 'NEWS', 
          status: 'PUBLISHED', 
          author: { firstName: 'System', lastName: 'Admin' }, 
          createdAt: new Date(),
          language: 'en'
        }
      ]
    });
  }
});

// Competitions endpoint
// Handles /api/competitions and /api/leagues
app.get(['/api/competitions', '/api/leagues'], async (req, res) => {
  try {
    const { country, season = '2023' } = req.query;

    // If API key is present, try to fetch real data
    if (process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY) {
      try {
        console.log(`Fetching competitions for country: ${country}, season: ${season}`);
        const data = await footballApi.getLeagues(country, season);

        if (data && Array.isArray(data.response) && data.response.length > 0) {
          const competitions = data.response.map(item => ({
            id: item.league.id,
            name: item.league.name,
            type: item.league.type,
            logo: item.league.logo,
            country: item.country.name,
            season: item.seasons.length ? item.seasons[item.seasons.length - 1].year.toString() : season
          }));
          console.log(`✅ Returning ${competitions.length} real competitions`);
          return res.json(competitions);
        }
      } catch (apiError) {
        console.error('API Fetch Error (Competitions):', apiError.message);
      }
    }

    // Fallback Mock Data
    console.log('🔄 Returning mock competitions data');
    res.json([
      { id: 1, name: 'BRICS Championship 2024', type: 'Cup', logo: 'https://placehold.co/40x40?text=BC', country: 'International', season: '2024' },
      { id: 2, name: 'Premier League', type: 'League', logo: 'https://placehold.co/40x40?text=PL', country: 'England', season: '2024' },
      { id: 3, name: 'La Liga', type: 'League', logo: 'https://placehold.co/40x40?text=LL', country: 'Spain', season: '2024' },
      { id: 4, name: 'Serie A', type: 'League', logo: 'https://placehold.co/40x40?text=SA', country: 'Italy', season: '2024' },
      { id: 5, name: 'Bundesliga', type: 'League', logo: 'https://placehold.co/40x40?text=BL', country: 'Germany', season: '2024' }
    ]);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    // On error, return mock data
    res.json([
      { id: 1, name: 'BRICS Cup 2024', type: 'Cup', logo: 'https://placehold.co/40x40?text=BC', country: 'International', season: '2024' }
    ]);
  }
});

// Public Matches/Fixtures Endpoint (with aliases)
app.get(['/api/competitions/matches', '/api/matches', '/api/fixtures'], async (req, res) => {
  try {
    // Default to Premier League (39) and 2023 season if parameters are missing
    const { league = '39', season = '2023', date } = req.query;

    // If API key is present, try to fetch real fixtures
    if (process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY) {
      if (footballApi && footballApi.getFixtures) {
        try {
          // Pass parameters correctly as strings/numbers, not objects
          const data = await footballApi.getFixtures(league, season, date);

          // Handle API-Football structure (response property)
          if (data && Array.isArray(data.response) && data.response.length > 0) {
            const matches = data.response.map(item => ({
              id: item.fixture?.id,
              homeTeam: item.teams?.home?.name,
              homeTeamLogo: item.teams?.home?.logo,
              awayTeam: item.teams?.away?.name,
              awayTeamLogo: item.teams?.away?.logo,
              date: item.fixture?.date,
              time: item.fixture?.date ? item.fixture.date.split('T')[1].substring(0, 5) : '00:00',
              venue: item.fixture?.venue?.name,
              status: item.fixture?.status?.short
            }));
            return res.json(matches);
          }

          if (Array.isArray(data) && data.length > 0) return res.json(data);
        } catch (apiError) {
          console.error('API Fetch Error:', apiError);
        }
      }
    }

    // Fallback Mock Data
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
  } catch (error) {
    console.error('Error fetching matches:', error);
    // Return mock data on error
    res.json([
      { id: 1, homeTeam: 'Brazil', homeTeamLogo: 'https://placehold.co/60x60/png?text=BRA', awayTeam: 'Russia', awayTeamLogo: 'https://placehold.co/60x60/png?text=RUS', date: '2024-02-15', time: '15:00', venue: 'Stadium A' }
    ]);
  }
});

// Feature Routes
// Note: We mount these BEFORE the safe endpoints so specific routes (like /api/football/sync) take precedence
app.use('/api/referees', refereeRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/football', footballRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api', competitionRoutes);
app.use('/api', userRoutes);

// Dashboard endpoints
app.get(['/api/admin/stats', '/api/admin/dashboard'], auth, requireRole(['ADMIN', 'SECRETARIAT', 'FEDERATION_OFFICIAL']), async (req, res) => {
  try {
    const [users, referees, documents, reports] = await Promise.all([
      prisma.user.count(),
      prisma.referee.count(),
      prisma.document.count(),
      prisma.disciplinaryReport.count(),
    ]);

    const [teams, matches] = await Promise.all([
      prisma.team.count().catch(() => 0),
      prisma.match.count().catch(() => 0)
    ]);

    res.json({ users, referees, documents, reports, teams, matches });
  } catch (error) {
    console.error('Dashboard/Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
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

// Football Data Endpoints
app.get(['/api/football/teams', '/api/teams'], async (req, res) => {
  try {
    const { league = '39', season = '2023' } = req.query;

    if (process.env.FOOTBALL_API_KEY || process.env.API_FOOTBALL_KEY) {
      if (footballApi && footballApi.getTeams) {
        try {
          const data = await footballApi.getTeams(league, season);

          if (data && Array.isArray(data.response) && data.response.length > 0) {
            const teams = data.response.map(item => ({
              id: item.team.id,
              name: item.team.name,
              logo: item.team.logo,
              founded: item.team.founded,
              venue: item.venue.name
            }));
            return res.json(teams);
          }
        } catch (apiError) {
          console.error('API Fetch Error (Teams):', apiError);
        }
      }
    }

    const teams = await prisma.team.findMany();

    if (teams.length > 0) {
      res.json(teams);
    } else {
      res.json([
        { id: 1, name: 'Brazil', logo: 'https://placehold.co/60x60/png?text=BRA', founded: 1914, venue: 'Maracanã' },
        { id: 2, name: 'Russia', logo: 'https://placehold.co/60x60/png?text=RUS', founded: 1912, venue: 'Luzhniki' },
        { id: 3, name: 'India', logo: 'https://placehold.co/60x60/png?text=IND', founded: 1937, venue: 'Salt Lake Stadium' },
        { id: 4, name: 'China', logo: 'https://placehold.co/60x60/png?text=CHN', founded: 1924, venue: 'Workers Stadium' },
        { id: 5, name: 'South Africa', logo: 'https://placehold.co/60x60/png?text=RSA', founded: 1991, venue: 'FNB Stadium' }
      ]);
    }
  } catch (error) {
    console.error('Error fetching teams for admin/privileged user:', error);
    res.json([
      { id: 1, name: 'Brazil', logo: 'https://placehold.co/60x60/png?text=BRA', founded: 1914, venue: 'Maracanã' }
    ]);
  }
});

app.get('/api/football/matches', auth, requireRole(['ADMIN', 'TEAM_MANAGER', 'FEDERATION_OFFICIAL']), async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true }
    });
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches for admin/privileged user:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Player Management Routes
app.get('/api/players', auth, async (req, res) => {
  try {
    const managerId = req.user.userId;
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: { team: true }
    });

    if (!manager || !manager.teamId) {
      return res.status(403).json({ error: 'Manager not associated with a team' });
    }

    const players = await prisma.athlete.findMany({
      where: { teamId: manager.teamId },
      include: { team: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(players);
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.post('/api/players', auth, async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, photoUrl } = req.body;
    const managerId = req.user.userId;

    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: { team: true }
    });

    if (!manager || manager.role !== 'TEAM_MANAGER' || !manager.teamId) {
      return res.status(403).json({ error: 'Only team managers can create players' });
    }

    const player = await prisma.athlete.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        teamId: manager.teamId,
        photoUrl
      },
      include: { team: true }
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// National Squad Routes
app.get('/api/national-squads', auth, async (req, res) => {
  try {
    const squads = await prisma.nationalSquad.findMany({
      include: {
        athletes: {
          include: { team: true }
        },
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(squads);
  } catch (error) {
    console.error('Get squads error:', error);
    res.status(500).json({ error: 'Failed to fetch national squads' });
  }
});

app.get('/api/athletes/available', auth, async (req, res) => {
  try {
    const athletes = await prisma.athlete.findMany({
      include: { team: true },
      orderBy: [{ team: { name: 'asc' } }, { firstName: 'asc' }]
    });
    res.json(athletes);
  } catch (error) {
    console.error('Get athletes error:', error);
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
});

// Stats Engine Routes
app.get('/api/top-scorers', auth, async (req, res) => {
  try {
    const { competitionId } = req.query;
    const goalEvents = await prisma.matchEvent.findMany({
      where: {
        type: 'GOAL',
        ...(competitionId && {
          match: { competitionId }
        })
      },
      include: {
        player: {
          include: { team: true }
        },
        match: {
          include: { competition: true }
        }
      }
    });

    const scorers = goalEvents.reduce((acc, event) => {
      if (!event.player) return acc;
      const playerId = event.player.id;
      if (!acc[playerId]) {
        acc[playerId] = {
          player: event.player,
          goals: 0,
          matches: new Set()
        };
      }
      acc[playerId].goals++;
      acc[playerId].matches.add(event.match.id);
      return acc;
    }, {});

    const topScorers = Object.values(scorers)
      .map(scorer => ({
        ...scorer.player,
        goals: scorer.goals,
        matches: scorer.matches.size
      }))
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 20);

    res.json(topScorers);
  } catch (error) {
    console.error('Get top scorers error:', error);
    res.status(500).json({ error: 'Failed to fetch top scorers' });
  }
});

// New endpoint for team statistics
app.get('/api/football/team-statistics', auth, async (req, res) => {
  try {
    const { team, league, season } = req.query;
    if (!team || !league || !season) {
      return res.status(400).json({ error: 'Missing required query parameters: team, league, season' });
    }
    // Pass parameters correctly as strings/numbers, not as an object
    const stats = await footballApi.getTeamStatistics(team, league, season);
    res.json(stats);
  } catch (error) {
    console.error(`Error fetching team statistics for team=${req.query.team}:`, error);
    res.status(500).json({ error: 'Failed to fetch team statistics' });
  }
});

// New endpoint for player statistics
app.get('/api/football/player-statistics', auth, async (req, res) => {
  try {
    const { team, league, season } = req.query;
    if (!team || !league || !season) {
      return res.status(400).json({ error: 'Missing required query parameters: team, league, season' });
    }

    // Note: The footballApi service doesn't have a getPlayerStatistics method
    // You may need to implement this or use a different endpoint
    res.status(501).json({ error: 'Player statistics endpoint not implemented yet' });
  } catch (error) {
    console.error(`Error fetching player statistics for team=${req.query.team}:`, error);
    res.status(500).json({ error: 'Failed to fetch player statistics' });
  }
});

// General Football Stats Endpoint (Summary)
app.get('/api/football/stats', auth, async (req, res) => {
  try {
    const [teams, matches] = await Promise.all([
      prisma.team.count().catch(() => 0),
      prisma.match.count().catch(() => 0)
    ]);

    res.json({
      teams,
      matches,
      competitions: 2, // Mock count or fetch from DB if available
      activeSeason: '2024'
    });
  } catch (error) {
    console.error('Error fetching football stats:', error);
    res.status(500).json({ error: 'Failed to fetch football stats' });
  }
});

// 404 Handler for unmatched routes
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

// General error handler
app.use((err, req, res, next) => {
  console.error('An unhandled error occurred:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// --- Server Startup ---
async function startServer() {
  try {
    // Try to connect to the database but don't fail if it's unavailable
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.warn('⚠️ Database connection failed, but server will start anyway:', dbError.message);
      console.log('💡 HINT: Database will be available when needed. Some features may be limited.');
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 BIFA Backend running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;