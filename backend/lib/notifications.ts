import { Request, Response } from 'express';

/**
 * SSE-based notification service for real-time events.
 *
 * Supports two modes:
 * 1. Admin stream: GET /api/notifications/stream (for admin dashboard)
 * 2. User stream:  GET /api/notifications/stream/user (for logged-in user notifications)
 */

interface SSEClient {
    id: string;
    userId?: string; // If set, this is a user-specific client
    role?: string;
    res: Response;
}

const clients: SSEClient[] = [];

/** Add a new SSE admin client connection */
export function addClient(req: Request, res: Response): void {
    const clientId = `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // SSE headers (CORS is handled by the cors() middleware)
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Send initial connected event
    res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    clients.push({ id: clientId, res });
    console.log(`📡 SSE admin client connected: ${clientId} (total: ${clients.length})`);

    // Keep-alive ping every 30s
    const keepAlive = setInterval(() => {
        try { res.write(`: ping\n\n`); } catch { /* client disconnected */ }
    }, 30_000);

    // Remove client on disconnect
    req.on('close', () => {
        clearInterval(keepAlive);
        const idx = clients.findIndex(c => c.id === clientId);
        if (idx !== -1) clients.splice(idx, 1);
        console.log(`📡 SSE admin client disconnected: ${clientId} (total: ${clients.length})`);
    });
}

/** Add a user-specific SSE client connection */
export function addUserClient(req: Request, res: Response, userId: string): void {
    const clientId = `user-${userId}-${Date.now()}`;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    clients.push({ id: clientId, userId, res });
    console.log(`📡 SSE user client connected: ${clientId} (total: ${clients.length})`);

    const keepAlive = setInterval(() => {
        try { res.write(`: ping\n\n`); } catch { /* client disconnected */ }
    }, 30_000);

    req.on('close', () => {
        clearInterval(keepAlive);
        const idx = clients.findIndex(c => c.id === clientId);
        if (idx !== -1) clients.splice(idx, 1);
        console.log(`📡 SSE user client disconnected: ${clientId} (total: ${clients.length})`);
    });
}

/** Broadcast an event to all connected admin clients (those without userId) */
function broadcastAdmin(event: string, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.filter(c => !c.userId).forEach(client => {
        try {
            client.res.write(payload);
        } catch {
            // Client disconnected, will be cleaned up
        }
    });
}

/** Broadcast an event to a specific user */
export function broadcastToUser(userId: string, event: string, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.filter(c => c.userId === userId).forEach(client => {
        try {
            client.res.write(payload);
        } catch {
            // Client disconnected
        }
    });
}

/** Broadcast an event to all user clients */
export function broadcastToAllUsers(event: string, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.filter(c => !!c.userId).forEach(client => {
        try {
            client.res.write(payload);
        } catch {
            // Client disconnected
        }
    });
}

/** Notify all admin clients about a new order */
export function notifyNewOrder(order: {
    id: string;
    orderNumber: string;
    totalAmount: any;
    phone?: string | null;
    address?: string | null;
    items?: any[];
    createdAt?: Date;
}): void {
    broadcastAdmin('new_order', {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        phone: order.phone,
        address: order.address,
        itemCount: order.items?.length ?? 0,
        createdAt: order.createdAt || new Date().toISOString(),
    });
}

/** Notify admin about order status change */
export function notifyOrderStatusChangeSSE(order: {
    id: string;
    orderNumber: string;
    status: string;
}): void {
    broadcastAdmin('order_status', order);
}

/** Get connected clients count */
export function getClientStats() {
    const adminClients = clients.filter(c => !c.userId).length;
    const userClients = clients.filter(c => !!c.userId).length;
    return { total: clients.length, admin: adminClients, user: userClients };
}
