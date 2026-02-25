/**
 * Auth Feature - Routes
 * API route definitions for authentication
 */

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../shared/middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/guest-checkout', authController.guestCheckout);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
