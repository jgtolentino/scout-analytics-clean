const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const database = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             email:
 *               type: string
 *             name:
 *               type: string
 *             role:
 *               type: string
 */

class AuthController {
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: User login
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Invalid credentials
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // For demo purposes, we'll use hardcoded users
      // In production, this would query the database
      const demoUsers = [
        {
          id: 1,
          email: 'admin@scout.com',
          password: await bcrypt.hash('admin123', 10),
          name: 'Scout Admin',
          role: 'admin'
        },
        {
          id: 2,
          email: 'analyst@scout.com',
          password: await bcrypt.hash('analyst123', 10),
          name: 'Data Analyst',
          role: 'analyst'
        },
        {
          id: 3,
          email: 'demo@scout.com',
          password: await bcrypt.hash('demo123', 10),
          name: 'Demo User',
          role: 'viewer'
        }
      ];

      const user = demoUsers.find(u => u.email === email);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Remove password from response
      const { password: _, ...userResponse } = user;

      res.json({
        success: true,
        token,
        user: userResponse,
        message: 'Login successful'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/auth/verify:
   *   get:
   *     summary: Verify JWT token
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Token is valid
   *       401:
   *         description: Invalid or expired token
   */
  async verify(req, res) {
    try {
      // If we reach here, the token is valid (middleware already verified it)
      res.json({
        success: true,
        user: req.user,
        message: 'Token is valid'
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Token verification failed',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: User logout
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   */
  async logout(req, res) {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return a success message
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  /**
   * @swagger
   * /api/auth/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile data
   */
  async getProfile(req, res) {
    try {
      // Return user info from the JWT token
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
