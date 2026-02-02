import express from "express";
import { getUsers, createUser, createTestUser, getProfile, updateUserRole, deleteUser } from "../controllers/userController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Protected routes with RBAC
router.get("/users", authenticateToken, requireRole("ADMIN", "SECRETARIAT"), getUsers);
router.post("/users", authenticateToken, requireRole("ADMIN"), createUser);
router.put("/users/:id/role", authenticateToken, requireRole("ADMIN"), updateUserRole);
router.delete("/users/:id", authenticateToken, requireRole("ADMIN"), deleteUser);
router.get("/profile", authenticateToken, getProfile);

// Admin-only routes
router.post("/admin/test-user", authenticateToken, requireRole("ADMIN"), createTestUser);
router.get("/admin/dashboard", authenticateToken, requireRole("ADMIN"), (req, res) => {
  res.json({ message: "Admin dashboard data", user: req.user });
});

// Secretariat routes
router.get("/secretariat/competitions", authenticateToken, requireRole("SECRETARIAT", "ADMIN"), (req, res) => {
  res.json({ message: "Secretariat competitions data", user: req.user });
});

// Referee routes
router.get("/referee/matches", authenticateToken, requireRole("REFEREE", "ADMIN"), (req, res) => {
  res.json({ message: "Referee matches data", user: req.user });
});

// Team Manager routes
router.get("/team-manager/squad", authenticateToken, requireRole("TEAM_MANAGER", "ADMIN"), (req, res) => {
  res.json({ message: "Team manager squad data", user: req.user });
});

// Federation Official routes
router.get("/federation/overview", authenticateToken, requireRole("FEDERATION_OFFICIAL", "ADMIN"), (req, res) => {
  res.json({ message: "Federation overview data", user: req.user });
});

// Public test endpoint (remove in production)
router.post("/test-user", createTestUser);

export default router;