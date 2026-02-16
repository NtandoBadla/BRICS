require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// --- Main Express Application ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Configuration ---
// This is the crucial implementation to fix the frontend error.
// It allows your frontend application (running on http://localhost:3000)
// to make requests to this backend.
const corsOptions = {
    origin: 'http://localhost:3000', // The origin of your frontend app
    optionsSuccessStatus: 200 // For legacy browser support
};

// --- Middleware ---
// 1. Enable CORS with the specified options. This MUST come before your routes.
app.use(cors(corsOptions));

// 2. Enable the Express app to parse JSON formatted request bodies.
app.use(express.json());

// --- Request Logging Middleware ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Placeholder Authentication Middleware ---
// This middleware will protect routes that require a logged-in user.
// It checks for an "Authorization: Bearer <token>" header.
const protect = (req, res, next) => {
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith('Bearer ')) {
        // If no token is provided, send a 401 Unauthorized response.
        // This is important because the frontend needs a clear error.
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    // In a real application, you would verify the token here.
    // For now, we'll just assume it's valid and proceed.
    next();
};

// --- API Routes ---
// Add your existing API route handlers here.

// 1. Auth Routes (Mock)
app.post('/api/auth/login', (req, res) => {
    console.log('Login attempt:', req.body.email);
    // Return a mock token and user
    res.json({
        token: 'mock-jwt-token-12345',
        user: {
            id: 1,
            email: req.body.email,
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User'
        }
    });
});

app.post('/api/auth/register', (req, res) => {
    res.json({ message: 'User registered successfully' });
});

// 2. Other Mock Routes (to prevent 404s on Dashboard widgets)
app.get('/api/cms/pages', (req, res) => res.json([]));
app.post('/api/cms/pages', protect, (req, res) => res.json({ success: true }));

app.post('/api/governance/tasks', protect, (req, res) => res.json({ success: true }));

app.get('/api/referees', (req, res) => res.json([]));

app.get('/api/disciplinary-reports', (req, res) => res.json([]));


// --- Example Health Check Route ---
// The `test-apis.js` script checks this route to see if the backend is running.
app.get('/', (req, res) => {
    res.status(200).json({ message: 'BIFA Platform Backend is running and ready.' });
});

// --- Example Admin Dashboard Route ---
// This is the endpoint your frontend is trying to fetch.
// It is now protected by our 'protect' middleware.
app.get('/api/admin/dashboard', protect, (req, res) => {
    const stats = { users: 150, pages: 12, reports: 5, tasks: 23 };
    res.status(200).json(stats);
});

// --- 404 Handler ---
app.use((req, res) => {
    console.log(`❌ 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Not Found', path: req.url });
});

// --- Server Activation ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});