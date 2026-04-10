import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  register,
  login,
  refresh,
  logout,
  updateFcmToken,
  registerSchema,
  loginSchema,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.patch('/fcm-token', authenticate, updateFcmToken);

export default router;
