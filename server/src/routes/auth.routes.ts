import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../schemas/auth.schema';

const router = Router();

// Public routes
router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login
);

// Protected routes (require valid JWT)
router.get(
  '/me',
  authenticate,
  authController.getMe
);

router.patch(
  '/profile',
  authenticate,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

export default router;
