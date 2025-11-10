import express from 'express';
import { validateCoupon } from '../controllers/coupon.controller';

const router = express.Router();

router.get('/validate', validateCoupon);

export default router;

