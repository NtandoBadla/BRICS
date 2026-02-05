const express = require("express");
const { getUsers, createUser, createTestUser, getProfile, updateUserRole, deleteUser } = require("../controllers/userController");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Protected routes with RBAC
router.get("/users", auth, requireRole(["ADMIN", "SECRETARIAT"]), getUsers);
router.post("/users", auth, requireRole(["ADMIN"]), createUser);
router.put("/users/:id/role", auth, requireRole(["ADMIN"]), updateUserRole);
router.delete("/users/:id", auth, requireRole(["ADMIN"]), deleteUser);
router.get("/profile", auth, getProfile);

// Admin-only routes
router.post("/admin/test-user", auth, requireRole(["ADMIN"]), createTestUser);
router.get("/admin/dashboard", auth, requireRole(["ADMIN"]), (req, res) => {
  res.json({ message: "Admin dashboard data", user: req.user });
});

// Secretariat routes
router.get("/secretariat/competitions", auth, requireRole(["SECRETARIAT", "ADMIN"]), (req, res) => {
  res.json({ message: "Secretariat competitions data", user: req.user });
});

// Referee routes
router.get("/referee/matches", auth, requireRole(["REFEREE", "ADMIN"]), (req, res) => {
  res.json({ message: "Referee matches data", user: req.user });
});

// Team Manager routes
router.get("/team-manager/squad", auth, requireRole(["TEAM_MANAGER", "ADMIN"]), (req, res) => {
  res.json({ message: "Team manager squad data", user: req.user });
});

// Federation Official routes
router.get("/federation/overview", auth, requireRole(["FEDERATION_OFFICIAL", "ADMIN"]), (req, res) => {
  res.json({ message: "Federation overview data", user: req.user });
});

// Public test endpoint (remove in production)
router.post("/test-user", createTestUser);

module.exports = router;