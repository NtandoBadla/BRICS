import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "../backend/src/routes/authRoutes.js";
import userRoutes from "../backend/src/routes/userRoutes.js";
import footballRoutes from "../backend/src/routes/footballRoutes.js";
import refereeRoutes from "../backend/src/routes/refereeRoutes.js";
import competitionRoutes from "../backend/src/routes/competitionRoutes.js";
import matchRoutes from "../backend/src/routes/matchRoutes.js";
import testRoutes from "../backend/src/routes/testRoutes.js";

dotenv.config();

const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "BIFA Backend API", 
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/hello", (req, res) => {
  res.json({ message: "Hello-World" });
});

// Core routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", testRoutes);

// Feature routes
app.use("/api/football", footballRoutes);
app.use("/api", refereeRoutes);
app.use("/api", competitionRoutes);
app.use("/api/matches", matchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;