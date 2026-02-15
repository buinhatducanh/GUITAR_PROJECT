import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────

/** Get all active shipping methods */
router.get('/', async (_req: Request, res: Response) => {
    try {
        const shippingMethods = await prisma.shippingMethod.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });

        res.json({ shippingMethods });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shipping methods' });
    }
});

/** Get shipping method by ID */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const shippingMethod = await prisma.shippingMethod.findUnique({
            where: { id }
        });

        if (!shippingMethod) {
            res.status(404).json({ error: 'Shipping method not found' });
            return;
        }

        res.json(shippingMethod);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shipping method' });
    }
});

/** Calculate shipping cost */
router.post('/calculate', async (req: Request, res: Response) => {
    try {
        const { shippingMethodId, distance, orderTotal } = req.body;

        if (!shippingMethodId) {
            res.status(400).json({ error: 'Shipping method ID is required' });
            return;
        }

        const method = await prisma.shippingMethod.findUnique({
            where: { id: shippingMethodId }
        });

        if (!method) {
            res.status(404).json({ error: 'Shipping method not found' });
            return;
        }

        if (!method.isActive) {
            res.status(400).json({ error: 'Shipping method is not active' });
            return;
        }

        // Calculate shipping cost
        let shippingCost = parseFloat(method.baseCost.toString());

        // Add distance-based cost if distance provided
        if (distance && distance > 0) {
            const costPerKm = parseFloat(method.costPerKm.toString());
            shippingCost += distance * costPerKm;
        }

        // Check if eligible for free shipping
        const freeThreshold = parseFloat(method.freeThreshold.toString());
        if (orderTotal && orderTotal >= freeThreshold) {
            shippingCost = 0;
        }

        res.json({
            shippingMethodId: method.id,
            shippingMethodName: method.name,
            baseCost: method.baseCost,
            costPerKm: method.costPerKm,
            distance: distance || 0,
            orderTotal: orderTotal || 0,
            freeThreshold: method.freeThreshold,
            shippingCost,
            isFreeShipping: shippingCost === 0,
            estimatedDays: method.estimatedDays
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate shipping cost' });
    }
});

// ─── Admin Routes ─────────────────────────────────────────

/** Get all shipping methods (Admin) */
router.get('/admin/all', authenticate, requireAdmin, async (_req: Request, res: Response) => {
    try {
        const shippingMethods = await prisma.shippingMethod.findMany({
            orderBy: [{ order: 'asc' }, { name: 'asc' }]
        });

        res.json({ shippingMethods });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch shipping methods' });
    }
});

/** Create shipping method (Admin only) */
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            baseCost,
            costPerKm,
            freeThreshold,
            estimatedDays,
            order
        } = req.body;

        // Validation
        if (!name || !baseCost || !costPerKm || !freeThreshold || !estimatedDays) {
            res.status(400).json({
                error: 'Missing required fields: name, baseCost, costPerKm, freeThreshold, estimatedDays'
            });
            return;
        }

        const shippingMethod = await prisma.shippingMethod.create({
            data: {
                name,
                description,
                baseCost: parseFloat(baseCost),
                costPerKm: parseFloat(costPerKm),
                freeThreshold: parseFloat(freeThreshold),
                estimatedDays,
                order: order || 0
            }
        });

        res.status(201).json(shippingMethod);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create shipping method' });
    }
});

/** Update shipping method (Admin only) */
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            baseCost,
            costPerKm,
            freeThreshold,
            estimatedDays,
            isActive,
            order
        } = req.body;

        const shippingMethod = await prisma.shippingMethod.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(baseCost !== undefined && { baseCost: parseFloat(baseCost) }),
                ...(costPerKm !== undefined && { costPerKm: parseFloat(costPerKm) }),
                ...(freeThreshold !== undefined && { freeThreshold: parseFloat(freeThreshold) }),
                ...(estimatedDays && { estimatedDays }),
                ...(typeof isActive === 'boolean' && { isActive }),
                ...(order !== undefined && { order })
            }
        });

        res.json(shippingMethod);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update shipping method' });
    }
});

/** Delete shipping method (Admin only) */
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.shippingMethod.delete({ where: { id } });

        res.json({ message: 'Shipping method deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete shipping method' });
    }
});

/** Toggle shipping method status (Admin only) */
router.patch('/:id/toggle', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const current = await prisma.shippingMethod.findUnique({
            where: { id }
        });

        if (!current) {
            res.status(404).json({ error: 'Shipping method not found' });
            return;
        }

        const updated = await prisma.shippingMethod.update({
            where: { id },
            data: { isActive: !current.isActive }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle shipping method' });
    }
});

/** Bulk update shipping methods order (Admin only) */
router.post('/bulk/reorder', authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { items } = req.body; // Array of { id, order }

        if (!Array.isArray(items)) {
            res.status(400).json({ error: 'Items must be an array' });
            return;
        }

        // Update all in a transaction
        await prisma.$transaction(
            items.map(item =>
                prisma.shippingMethod.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        );

        res.json({ message: 'Shipping methods reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reorder shipping methods' });
    }
});

export default router;
