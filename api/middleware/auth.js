const jwt = require('jsonwebtoken');
const keyVaultConfig = require('../config/keyVault');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid JWT token in the Authorization header'
    });
  }

  try {
    const jwtSecret = keyVaultConfig.getJWTSecret();
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid.'
      });
    }

    return res.status(500).json({ 
      error: 'Token verification failed',
      message: 'An error occurred while verifying your token.'
    });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const jwtSecret = keyVaultConfig.getJWTSecret();
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }
  
  next();
};

const generateToken = (payload) => {
  const jwtSecret = keyVaultConfig.getJWTSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken
};
