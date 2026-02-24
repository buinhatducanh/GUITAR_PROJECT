import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/** GET /api/categories — list all with children + product count */
router.get('/', async (_req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                children: {
                    include: { _count: { select: { products: true } } },
                },
                _count: { select: { products: true } },
            },
            where: { parentId: null }, // Top-level only
            orderBy: { name: 'asc' },
        });

        res.json(categories);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/categories/all — flat list */
router.get('/all', async (_req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        });

        res.json(categories);
    } catch (err) {
        console.error('Get all categories error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/categories — create (admin only) */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { name, parentId, icon } = req.body;

        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const category = await prisma.category.create({
            data: { name, slug, parentId, icon },
        });

        res.status(201).json(category);
    } catch (err) {
        console.error('Create category error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/categories/:id — update (admin only) */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const category = await prisma.category.update({
            where: { id: req.params.id },
            data: req.body,
        });

        res.json(category);
    } catch (err) {
        console.error('Update category error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/categories/:id — delete (admin only) */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        await prisma.category.delete({ where: { id: req.params.id } });
        res.json({ message: 'Đã xóa danh mục' });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
