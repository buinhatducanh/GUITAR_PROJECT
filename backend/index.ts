import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import blogRoutes from './routes/blogs.js';
import bannerRoutes from './routes/banners.js';
import voucherRoutes from './routes/vouchers.js';
import eventRoutes from './routes/events.js';
import uploadRoutes from './routes/upload.js';
import orderRoutes from './routes/orders.js';
import landingPageRoutes from './routes/landing-pages.js';
// Old routes (to be refactored)
import settingsRoutes from './routes/settings.js';
import inventoryRoutes from './routes/inventory.js';
import analyticsRoutes from './routes/analytics.js';
import shippingRoutes from './routes/shipping.js';

// ─── MVC Feature Routes ─────────────────────────────────
import authRoutes from './features/auth/auth.routes.js';
import brandsRoutes from './features/brands/brands.routes.js';
import { addClient } from './lib/notifications.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────
app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
}));
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://guitarproject.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Health check ───────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ─────────────────────────────────────
// MVC Structure (Refactored)
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandsRoutes);

// Old Structure (To be refactored)
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/landing-pages', landingPageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/shipping', shippingRoutes);

// ─── SSE Notifications Stream ───────────────────
app.get('/api/notifications/stream', (req, res) => {
    addClient(req, res);
});

// ─── 404 handler ────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route không tồn tại' });
});

// ─── Start server ───────────────────────────────
app.listen(PORT, () => {
    console.log(`🎸 Guitar NOVA API running at http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
