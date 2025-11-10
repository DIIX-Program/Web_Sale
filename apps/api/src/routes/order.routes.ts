import express from 'express';
import {
  createOrder,
  getOrder,
  getMyOrders,
} from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // All order routes require authentication

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);

export default router;

