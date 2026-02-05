const prisma = require("../prisma");
const bcrypt = require("bcryptjs");
const { sendRoleUpdateEmail } = require("../services/emailService");

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
    });
    
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Get current user data for email notification
    const currentUser = await prisma.user.findUnique({
      where: { id }, // Use string ID directly, not parseInt
      select: { email: true, firstName: true, lastName: true, role: true }
    });
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = await prisma.user.update({
      where: { id }, // Use string ID directly, not parseInt
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
    });
    
    // Send email notification about role change
    const userName = `${currentUser.firstName} ${currentUser.lastName}`;
    await sendRoleUpdateEmail(currentUser.email, userName, currentUser.role, role);
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id } // Use string ID directly, not parseInt
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTestUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email: "admin@bifa.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN"
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getProfile,
  createUser,
  updateUserRole,
  deleteUser,
  createTestUser
};