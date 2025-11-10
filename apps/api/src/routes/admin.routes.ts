import express from 'express';
import { protect, admin } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getRevenueChart,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
  getAdminOrders,
  updateOrderStatus,
  getAdminUsers,
  createCoupon,
  getAdminCoupons,
} from '../controllers/admin.controller';
import { getLogo, updateLogo } from '../controllers/logo.controller';
import {
  createInvoice,
  getInvoices,
  getInvoice,
  exportInvoicePDF,
} from '../controllers/invoice.controller';
import { upload } from '../utils/cloudinary';

const router = express.Router();

router.use(protect); // All admin routes require authentication
router.use(admin); // All admin routes require admin role

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/revenue', getRevenueChart);

// Products
router
  .route('/products')
  .get(getAdminProducts)
  .post(upload.array('images', 10), createProduct);

router
  .route('/products/:id')
  .put(upload.array('images', 10), updateProduct)
  .delete(deleteProduct);

// Orders
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Users
router.get('/users', getAdminUsers);

// Coupons
router.route('/coupons').get(getAdminCoupons).post(createCoupon);

// Logo Settings
router.get('/logo', getLogo);
router.put('/logo', updateLogo);

// Invoices
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);
router.get('/invoices/:id', getInvoice);
router.get('/invoices/:id/pdf', exportInvoicePDF);

export default router;

