import express from 'express';
import {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);
router.get('/me', protect, getMe);

export default router;

