import { Request, Response, NextFunction } from 'express';

/**
 * In-memory rate limiter middleware.
 *
 * Creates a sliding-window counter per key (IP + optional fingerprint).
 * When the limit is exceeded the request is rejected with 429.
 *
 * Usage:
 *   router.post('/orders', rateLimit({ windowMs: 60_000, max: 3 }), handler);
 */

interface RateLimitOptions {
    /** Time window in milliseconds (default 60 000 = 1 min) */
    windowMs?: number;
    /** Max requests allowed per window (default 5) */
    max?: number;
    /** Custom message when rate-limited */
    message?: string;
    /** Custom key extractor — defaults to IP + x-fingerprint header */
    keyGenerator?: (req: Request) => string;
}

interface HitRecord {
    count: number;
    resetAt: number;
}

const stores = new Map<string, Map<string, HitRecord>>();

export function rateLimit(opts: RateLimitOptions = {}) {
    const {
        windowMs = 60_000,      // 1 minute default
        max = 5,                 // 5 requests per window
        message = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
        keyGenerator,
    } = opts;

    // Each middleware instance gets its own store
    const storeId = `rl_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    stores.set(storeId, new Map());
    const store = stores.get(storeId)!;

    // Cleanup expired entries every 5 minutes
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of store) {
            if (now > record.resetAt) store.delete(key);
        }
    }, 5 * 60_000);
    cleanupInterval.unref?.(); // Don't prevent process exit

    return (req: Request, res: Response, next: NextFunction): void => {
        const key = keyGenerator
            ? keyGenerator(req)
            : getDefaultKey(req);

        const now = Date.now();
        const record = store.get(key);

        if (!record || now > record.resetAt) {
            // First request or window expired — start fresh
            store.set(key, { count: 1, resetAt: now + windowMs });
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', max - 1);
            next();
            return;
        }

        if (record.count >= max) {
            const retryAfter = Math.ceil((record.resetAt - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.status(429).json({
                error: message,
                retryAfterSeconds: retryAfter,
            });
            return;
        }

        // Increment and continue
        record.count++;
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - record.count);
        next();
    };
}

function getDefaultKey(req: Request): string {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const fingerprint = req.headers['x-fingerprint'] as string || '';
    // Combine IP + fingerprint so that same browser on same IP = same key
    return fingerprint ? `${ip}__${fingerprint}` : ip;
}
