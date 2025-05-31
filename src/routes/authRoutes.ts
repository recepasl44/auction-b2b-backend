// F:\b2b-auction-backend\src\routes\authRoutes.ts
import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', (req, res) => {
  Promise.resolve(AuthController.register(req, res));
});

// GET /api/auth/verifyEmail?token=...
authRouter.get('/verifyEmail', (req, res) => {
  Promise.resolve(AuthController.verifyEmail(req, res));
});

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  Promise.resolve(AuthController.login(req, res));
});

// GET /api/auth/profile
authRouter.get('/profile', authMiddleware, (req, res) => {
  Promise.resolve(AuthController.getProfile(req, res));
});

/**
 * Opsiyonel şifre reset akışı (#19)
 * - POST /api/auth/forgotPassword
 * - POST /api/auth/resetPassword
 */
authRouter.post('/forgotPassword', (req, res) => {
  Promise.resolve(AuthController.forgotPassword(req, res));
});
authRouter.post('/refreshToken', (req, res) => {
  Promise.resolve(AuthController.refreshToken(req, res));
});
authRouter.post('/resetPassword', (req, res) => {
  Promise.resolve(AuthController.resetPassword(req, res));
});

export default authRouter;
