/**
 * Auth Feature - Service Layer
 * Business logic for authentication operations
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../shared/lib/prisma.js';
import { JWT_SECRET } from '../../shared/middleware/auth.js';
import type { RegisterDto, LoginDto, GuestCheckoutDto, AuthResponse, UserResponse, TokenPayload } from './auth.types.js';

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
        },
    });

    if (!user) {
        throw new Error('User không tồn tại');
    }

    return user;
};

/**
 * Generate JWT token
 */
const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};
