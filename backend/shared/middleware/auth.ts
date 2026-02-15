import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'guitar-nova-secret-2024';

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

/** Verify JWT token from Authorization header */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Không có token xác thực' });
        return;
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch {
        res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}

/** Require ADMIN role */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.userRole !== 'ADMIN') {
        res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
        return;
    }
    next();
}

export { JWT_SECRET };
