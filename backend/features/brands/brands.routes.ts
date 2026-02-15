import { Router } from 'express';
import * as brandController from './brands.controller.js';
import { authenticate, requireAdmin } from '../../shared/middleware/auth.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────

/** Get all brands */
router.get('/', brandController.getAllBrands);

/** Get brand by slug */
router.get('/:slug', brandController.getBrandBySlug);

/** Get products by brand */
router.get('/:id/products', brandController.getBrandProducts);

// ─── Admin Routes ─────────────────────────────────────────

/** Create brand (Admin only) */
router.post('/', authenticate, requireAdmin, brandController.createBrand);

/** Update brand (Admin only) */
router.put('/:id', authenticate, requireAdmin, brandController.updateBrand);

/** Delete brand (Admin only) */
router.delete('/:id', authenticate, requireAdmin, brandController.deleteBrand);

/** Get brand analytics (Admin only) */
router.get('/:id/analytics', authenticate, requireAdmin, brandController.getBrandAnalytics);

export default router;
