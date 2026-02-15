/**
 * Auth Feature - Service Layer
 * Business logic for authentication operations
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../shared/lib/prisma.js';
import { JWT_SECRET } from '../../shared/middleware/auth.js';
import type { RegisterDto, LoginDto, AuthResponse, UserResponse, TokenPayload } from './auth.types.js';

/**
 * Register new user
 */
export const register = async (data: RegisterDto): Promise<AuthResponse> => {
    // Validate input
    if (!data.name || !data.email || !data.password) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (existing) {
        throw new Error('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
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
 * Login user
 */
export const login = async (data: LoginDto): Promise<AuthResponse> => {
    // Validate input
    if (!data.email || !data.password) {
        throw new Error('Vui lòng nhập email và mật khẩu');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Verify password
    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
        throw new Error('Email hoặc mật khẩu không đúng');
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
