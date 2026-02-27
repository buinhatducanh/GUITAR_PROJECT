import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/prisma.js';
import { JWT_SECRET, authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '793211982417-tgutr9h682lucoqi66gpc778q23or95a.apps.googleusercontent.com');

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

        res.status(201).json({
            user: {
                ...user,
                joinDate: user.createdAt,
                lastLogin: new Date(),
                totalOrders: 0,
                totalSpent: 0,
            },
            token,
        });
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
                totalOrders: 0,
                totalSpent: 0,
            },
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/auth/google — authenticate via Google Sign-In popup */
router.post('/google', async (req, res) => {
    try {
        const { credential, accessToken } = req.body;
        if (!credential && !accessToken) {
            res.status(400).json({ error: 'Missing Google credentials' });
            return;
        }

        let payload: any = null;

        if (accessToken) {
            // Verify and get user info using accessToken
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!response.ok) {
                res.status(400).json({ error: 'Invalid Google access token' });
                return;
            }
            payload = await response.json();
            // UserInfo endpoint returns `sub` as the user ID, same as ID token
        } else if (credential) {
            // Verify ID Token (credential)
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID || '793211982417-tgutr9h682lucoqi66gpc778q23or95a.apps.googleusercontent.com',
            });
            payload = ticket.getPayload();
        }

        if (!payload || !payload.email) {
            res.status(400).json({ error: 'Invalid Google token payload' });
            return;
        }

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: payload.sub },
                    { email: payload.email }
                ]
            }
        });

        if (!user) {
            const randomPassword = await bcrypt.hash(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(), 10);
            user = await prisma.user.create({
                data: {
                    name: payload.name || 'Người dùng Google',
                    email: payload.email,
                    googleId: payload.sub,
                    avatar: payload.picture,
                    password: randomPassword
                }
            });
        } else if (!user.googleId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: payload.sub,
                    avatar: user.avatar || payload.picture
                }
            });
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
                totalOrders: 0,
                totalSpent: 0,
            },
            token,
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ error: 'Lỗi xác thực Google' });
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

        const aggregations = await prisma.order.aggregate({
            where: {
                userId: req.userId,
                status: { not: 'CANCELLED' }
            },
            _count: { id: true },
            _sum: { totalAmount: true }
        });

        res.json({
            ...user,
            totalOrders: aggregations._count.id || 0,
            totalSpent: aggregations._sum.totalAmount ? Number(aggregations._sum.totalAmount.toString()) : 0
        });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
