import express from 'express';
import { getMe, updateProfile, addAddress } from '../controllers/user.controller';
import { getInvoices, getInvoice, exportInvoicePDF } from '../controllers/invoice.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // All user routes require authentication

router.get('/me', getMe);
router.put('/me', updateProfile);
router.post('/me/addresses', addAddress);

// User invoices
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoice);
router.get('/invoices/:id/pdf', exportInvoicePDF);

export default router;

