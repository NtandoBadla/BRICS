import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

// Alias for consistency
export const authenticateToken = auth;

// Middleware to authorize based on user roles
export const requireRole = (allowedRoles) => {
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