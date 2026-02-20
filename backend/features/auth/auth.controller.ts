/**
 * Auth Feature - Controller Layer
 * HTTP request/response handlers
 */

import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { successResponse, errorResponse, notFoundResponse } from '../../shared/utils/response.js';
import type { AuthRequest } from '../../shared/middleware/auth.js';

/**
 * POST /api/auth/register
 * Register new user
 */
export const register = async (req: Request, res: Response) => {
    try {
        const result = await authService.register(req.body);
        return successResponse(res, result, 201);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Vui lòng điền đầy đủ thông tin') {
                return errorResponse(res, error, 400);
            }
            if (error.message === 'Số điện thoại đã được sử dụng') {
                return errorResponse(res, error, 409);
            }
        }
        return errorResponse(res, error);
    }
};

/**
 * POST /api/auth/login
 * Login user by phone
 */
export const login = async (req: Request, res: Response) => {
    try {
        const result = await authService.login(req.body);
        return successResponse(res, result);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Vui lòng nhập số điện thoại và mật khẩu') {
                return errorResponse(res, error, 400);
            }
            if (error.message === 'Số điện thoại hoặc mật khẩu không đúng') {
                return errorResponse(res, error, 401);
            }
        }
        return errorResponse(res, error);
    }
};

/**
 * POST /api/auth/guest-checkout
 * Find or create user by phone for guest checkout
 */
export const guestCheckout = async (req: Request, res: Response) => {
    try {
        const result = await authService.guestCheckout(req.body);
        return successResponse(res, result);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Vui lòng nhập số điện thoại') {
                return errorResponse(res, error, 400);
            }
        }
        return errorResponse(res, error);
    }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.userId) {
            return errorResponse(res, new Error('Unauthorized'), 401);
        }

        const user = await authService.getCurrentUser(req.userId);
        return successResponse(res, user);
    } catch (error) {
        if (error instanceof Error && error.message === 'User không tồn tại') {
            return notFoundResponse(res, error.message);
        }
        return errorResponse(res, error);
    }
};
