import express from 'express';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  getRelatedProducts,
  getCategories,
} from '../controllers/product.controller';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);

export default router;

