import { Router } from 'express';
import {
  register,
  login,
  refreshTokens,
  logout,
  getProfile,
} from '../controllers/auth.controller.js';
import {
  registerValidator,
  loginValidator,
  refreshValidator,
} from '../validators/auth.validators.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, name]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *                 minLength: 2
 *     responses:
 *       '201':
 *         description: Created user with tokens
 *       '409':
 *         description: User with this username already exists
 */
router.post('/register', registerValidator, register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Authenticated user with tokens
 *       '401':
 *         description: Invalid credentials
 */
router.post('/login', loginValidator, login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: New token pair
 *       '401':
 *         description: Invalid or expired token
 */
router.post('/refresh', refreshValidator, refreshTokens);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Logged out successfully
 *       '401':
 *         description: Invalid or expired token
 */
router.post('/logout', authenticate, logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile
 *       '401':
 *         description: Invalid or expired token
 */
router.get('/me', authenticate, getProfile);

export default router;
