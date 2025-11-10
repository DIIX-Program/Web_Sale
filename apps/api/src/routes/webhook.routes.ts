import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';

const router = express.Router();

// Stripe webhook (must be before express.json() middleware)
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export default router;

