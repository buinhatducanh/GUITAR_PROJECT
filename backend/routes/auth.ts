import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { JWT_SECRET, authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/** POST /api/auth/register */
router.post('/register', async (req, res) => {
    try {
        const { name, phone, password, email } = req.body;

        if (!name || !phone || !password) {
            res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
            return;
        }

        const existing = await prisma.user.findUnique({ where: { phone } });
        if (existing) {
            res.status(409).json({ error: 'Số điện thoại đã được sử dụng' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, phone, email, password: hashedPassword },
            select: { id: true, name: true, phone: true, email: true, avatar: true, points: true, role: true, tier: true, createdAt: true },
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user, token });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/auth/login */
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            res.status(400).json({ error: 'Vui lòng nhập số điện thoại và mật khẩu' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
            res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không đúng' });
            return;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không đúng' });
            return;
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                avatar: user.avatar,
                points: user.points,
                role: user.role,
                tier: user.tier,
                lastLogin: new Date(),
            },
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/auth/me — get current user profile */
router.get('/me', authenticate, async (req: AuthRequest, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true, name: true, phone: true, email: true, avatar: true,
                points: true, role: true, tier: true, lastLogin: true, createdAt: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'User không tồn tại' });
            return;
        }

        res.json(user);
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
