/**
 * Auth Feature - Service Layer
 * Business logic for authentication operations
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../../shared/lib/prisma.js';
import { JWT_SECRET } from '../../shared/middleware/auth.js';
import type { RegisterDto, LoginDto, GuestCheckoutDto, GoogleAuthDto, AuthResponse, UserResponse, TokenPayload } from './auth.types.js';
import { notifyWelcome } from '../../lib/notification.helper.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Register new user
 */
export const register = async (data: RegisterDto): Promise<AuthResponse> => {
    // Validate input
    if (!data.name || !data.phone || !data.password) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
    }

    // Check if phone already exists
    const existing = await prisma.user.findUnique({
        where: { phone: data.phone }
    });

    if (existing) {
        throw new Error('Số điện thoại đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            name: data.name,
            phone: data.phone,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            points: true,
            role: true,
            tier: true,
            createdAt: true,
        },
    });

    // Generate JWT token
    const token = generateToken({ userId: user.id, role: user.role });

    // Send welcome notification
    notifyWelcome(user.id, user.name);

    return { user, token };
};

/**
 * Login user by phone
 */
export const login = async (data: LoginDto): Promise<AuthResponse> => {
    // Validate input
    if (!data.phone || !data.password) {
        throw new Error('Vui lòng nhập số điện thoại và mật khẩu');
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
        where: { phone: data.phone }
    });

    if (!user) {
        throw new Error('Số điện thoại hoặc mật khẩu không đúng');
    }

    // Verify password
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
        throw new Error('Số điện thoại hoặc mật khẩu không đúng');
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const token = generateToken({ userId: user.id, role: user.role });

    // Fetch stats
    const aggregations = await prisma.order.aggregate({
        where: { userId: user.id, status: { not: 'CANCELLED' } },
        _count: { id: true },
        _sum: { totalAmount: true }
    });

    // Return user data and token
    return {
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
            createdAt: user.createdAt,
            totalOrders: aggregations._count.id || 0,
            totalSpent: aggregations._sum.totalAmount ? Number(aggregations._sum.totalAmount.toString()) : 0
        },
        token,
    };
};

/**
 * Guest checkout - find or create user by phone
 */
export const guestCheckout = async (data: GuestCheckoutDto): Promise<AuthResponse> => {
    if (!data.phone) {
        throw new Error('Vui lòng nhập số điện thoại');
    }

    // Check if user exists with this phone
    let user = await prisma.user.findUnique({
        where: { phone: data.phone }
    });

    if (!user) {
        // Auto-create account: phone = password
        const hashedPassword = await bcrypt.hash(data.phone, 10);

        user = await prisma.user.create({
            data: {
                name: data.name || `KH_${data.phone.slice(-4)}`,
                phone: data.phone,
                password: hashedPassword,
                points: 100,
            },
        });
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    // Fetch stats
    const aggregations = await prisma.order.aggregate({
        where: { userId: user.id, status: { not: 'CANCELLED' } },
        _count: { id: true },
        _sum: { totalAmount: true }
    });

    return {
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
            createdAt: user.createdAt,
            totalOrders: aggregations._count.id || 0,
            totalSpent: aggregations._sum.totalAmount ? Number(aggregations._sum.totalAmount.toString()) : 0
        },
        token,
    };
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (userId: string): Promise<UserResponse> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            points: true,
            role: true,
            tier: true,
            lastLogin: true,
            createdAt: true,
            googleId: true,
        },
    });

    if (!user) {
        throw new Error('User không tồn tại');
    }

    const aggregations = await prisma.order.aggregate({
        where: {
            userId,
            status: { not: 'CANCELLED' }
        },
        _count: { id: true },
        _sum: { totalAmount: true }
    });

    return {
        ...user,
        totalOrders: aggregations._count.id || 0,
        totalSpent: aggregations._sum.totalAmount ? Number(aggregations._sum.totalAmount.toString()) : 0
    };
};

/**
 * Update current user profile (name and email)
 */
export const updateProfile = async (userId: string, data: { name?: string; email?: string }): Promise<UserResponse> => {
    // If email is being updated, check if it's already taken
    if (data.email) {
        const existingEmailUser = await prisma.user.findFirst({
            where: {
                email: data.email,
                id: { not: userId }
            }
        });

        if (existingEmailUser) {
            throw new Error('Email này đã được sử dụng bởi tài khoản khác');
        }
    }

    // Check if user is trying to change email but is a Google user
    if (data.email) {
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { googleId: true, email: true }
        });

        if (currentUser?.googleId && currentUser.email !== data.email) {
            throw new Error('Tài khoản liên kết Google không thể thay đổi email');
        }
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.email && { email: data.email })
        },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            points: true,
            role: true,
            tier: true,
            lastLogin: true,
            createdAt: true,
        },
    });

    return user;
};

/**
 * Login/Register via Google OAuth
 */
export const googleLogin = async (data: GoogleAuthDto): Promise<AuthResponse> => {
    if (!data.credential && !data.accessToken) {
        throw new Error('Token Google không hợp lệ');
    }

    let payload: any = null;

    if (data.accessToken) {
        // Authenticate via Access Token (using useGoogleLogin)
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        if (!response.ok) {
            throw new Error('Token Google không hợp lệ');
        }
        payload = await response.json();
    } else if (data.credential) {
        // Verify Google ID token (standard credential)
        const ticket = await googleClient.verifyIdToken({
            idToken: data.credential,
            audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    }

    if (!payload || !payload.sub) {
        throw new Error('Token Google không hợp lệ');
    }

    const { sub: googleId, email, name, picture } = payload;

    // Try to find existing user by googleId
    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user && email) {
        // Try to find by email and link Google account
        user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId, avatar: user.avatar || picture },
            });
        }
    }

    if (!user) {
        // Create new user from Google info
        const { randomUUID } = await import('crypto');
        const hashedPassword = await bcrypt.hash(randomUUID(), 10);

        user = await prisma.user.create({
            data: {
                googleId,
                email: email || undefined,
                name: name || 'Google User',
                password: hashedPassword,
                avatar: picture || undefined,
                points: 100, // Welcome bonus
            },
        });

        // Send welcome notification for new Google users
        notifyWelcome(user.id, user.name);
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    // Fetch stats
    const aggregations = await prisma.order.aggregate({
        where: { userId: user.id, status: { not: 'CANCELLED' } },
        _count: { id: true },
        _sum: { totalAmount: true }
    });

    return {
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
            createdAt: user.createdAt,
            totalOrders: aggregations._count.id || 0,
            totalSpent: aggregations._sum.totalAmount ? Number(aggregations._sum.totalAmount.toString()) : 0
        },
        token,
    };
};

/**
 * Generate JWT token
 */
const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
