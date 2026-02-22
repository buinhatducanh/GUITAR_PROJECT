import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { deleteCloudinaryImages, collectImageUrls } from '../shared/utils/cloudinary-cleanup.js';

const router = Router();

/** GET /api/blogs — list with pagination */
router.get('/', async (req, res) => {
    try {
        const {
            page = '1',
            limit = '10',
            category,
            search,
            published,
        } = req.query as Record<string, string>;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (published !== 'false') {
            where.isPublished = true;
        }

        if (category) {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.blogPost.count({ where }),
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
        console.error('Get blogs error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/blogs/:slug */
router.get('/:slug', async (req, res) => {
    try {
        // findUnique first to check existence, then increment views
        const post = await prisma.blogPost.findUnique({
            where: { slug: req.params.slug },
        });

        if (!post) {
            res.status(404).json({ error: 'Bài viết không tồn tại' });
            return;
        }

        // Increment views non-blocking
        const updated = await prisma.blogPost.update({
            where: { id: post.id },
            data: { views: { increment: 1 } },
        });

        res.json(updated);
    } catch (err) {
        console.error('Get blog error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/blogs — create (admin only) */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { title, excerpt, content, coverImage, authorName, authorAvatar, category, tags, readTime, isPublished } = req.body;

        const slug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        let finalSlug = slug;
        let counter = 1;
        while (await prisma.blogPost.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${slug}-${counter++}`;
        }

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug: finalSlug,
                excerpt,
                content,
                coverImage,
                authorName: authorName || 'Admin',
                authorAvatar,
                category: category || 'Uncategorized',
                tags: tags || [],
                readTime: readTime || 5,
                isPublished: isPublished || false,
                publishedDate: isPublished ? new Date() : null,
            },
        });

        res.status(201).json(post);
    } catch (err) {
        console.error('Create blog error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/blogs/:id */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { title, excerpt, content, coverImage, authorName, authorAvatar, category, tags, readTime, isPublished, slug } = req.body;

        // Fetch old record to compare images for Cloudinary cleanup
        const oldPost = await prisma.blogPost.findUnique({
            where: { id: req.params.id },
            select: { coverImage: true, authorAvatar: true, isPublished: true, publishedDate: true },
        });

        if (!oldPost) {
            res.status(404).json({ error: 'Bài viết không tồn tại' });
            return;
        }

        // Build update data with only allowed fields
        const data: any = {};
        if (title !== undefined) data.title = title;
        if (slug !== undefined) data.slug = slug;
        if (excerpt !== undefined) data.excerpt = excerpt;
        if (content !== undefined) data.content = content;
        if (coverImage !== undefined) data.coverImage = coverImage;
        if (authorName !== undefined) data.authorName = authorName;
        if (authorAvatar !== undefined) data.authorAvatar = authorAvatar;
        if (category !== undefined) data.category = category;
        if (tags !== undefined) data.tags = tags;
        if (readTime !== undefined) data.readTime = typeof readTime === 'string' ? parseInt(readTime) || 5 : readTime;
        if (isPublished !== undefined) {
            data.isPublished = isPublished;
            // Set publishedDate when first publishing
            if (isPublished && !oldPost.publishedDate) {
                data.publishedDate = new Date();
            }
        }

        const post = await prisma.blogPost.update({
            where: { id: req.params.id },
            data,
        });

        // Cleanup old Cloudinary images if they were replaced
        const oldUrls: string[] = [];
        if (coverImage !== undefined && oldPost.coverImage && oldPost.coverImage !== coverImage) {
            oldUrls.push(oldPost.coverImage);
        }
        if (authorAvatar !== undefined && oldPost.authorAvatar && oldPost.authorAvatar !== authorAvatar) {
            oldUrls.push(oldPost.authorAvatar);
        }
        if (oldUrls.length > 0) {
            deleteCloudinaryImages(oldUrls).catch(() => {});
        }

        res.json(post);
    } catch (err) {
        console.error('Update blog error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/blogs/:id */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const blog = await prisma.blogPost.findUnique({
            where: { id: req.params.id },
            select: { coverImage: true, authorAvatar: true },
        });

        await prisma.blogPost.delete({ where: { id: req.params.id } });

        if (blog) {
            const urls = collectImageUrls(blog, ['coverImage', 'authorAvatar']);
            deleteCloudinaryImages(urls).catch(() => {});
        }

        res.json({ message: 'Đã xóa bài viết' });
    } catch (err) {
        console.error('Delete blog error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
