import { Router, Request } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/** GET /api/post-tests — list all with pagination */
router.get('/', async (req, res) => {
    try {
        const {
            page = '1',
            limit = '10',
            search,
        } = req.query as Record<string, string>;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [posts, total] = await Promise.all([
            prisma.postTest.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.postTest.count({ where }),
        ]);

        res.json({
            posts,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error('Get post-tests error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/post-tests/:id — get single post */
router.get('/:id', async (req: Request<{ id: string }>, res) => {
    try {
        const post = await prisma.postTest.findUnique({
            where: { id: req.params.id },
        });

        if (!post) {
            res.status(404).json({ error: 'Bài viết không tồn tại' });
            return;
        }

        res.json(post);
    } catch (err) {
        console.error('Get post-test error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/post-tests — create (admin only) */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !title.trim()) {
            res.status(400).json({ error: 'Tiêu đề không được để trống' });
            return;
        }

        if (!content || !content.trim()) {
            res.status(400).json({ error: 'Nội dung không được để trống' });
            return;
        }

        const post = await prisma.postTest.create({
            data: {
                title: title.trim(),
                content: content.trim(),
            },
        });

        res.status(201).json(post);
    } catch (err) {
        console.error('Create post-test error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/post-tests/:id — update (admin only) */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest & { params: { id: string } }, res) => {
    try {
        const { title, content } = req.body;
        const id = req.params.id as string;

        const existing = await prisma.postTest.findUnique({
            where: { id },
        });

        if (!existing) {
            res.status(404).json({ error: 'Bài viết không tồn tại' });
            return;
        }

        const data: any = {};
        if (title !== undefined) data.title = title.trim();
        if (content !== undefined) data.content = content.trim();

        const post = await prisma.postTest.update({
            where: { id },
            data,
        });

        res.json(post);
    } catch (err) {
        console.error('Update post-test error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/post-tests/:id — delete (admin only) */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest & { params: { id: string } }, res) => {
    try {
        const id = req.params.id as string;

        const existing = await prisma.postTest.findUnique({
            where: { id },
        });

        if (!existing) {
            res.status(404).json({ error: 'Bài viết không tồn tại' });
            return;
        }

        await prisma.postTest.delete({ where: { id } });

        res.json({ message: 'Đã xóa bài viết' });
    } catch (err) {
        console.error('Delete post-test error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
