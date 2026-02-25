import { Request, Response } from 'express';

/**
 * SSE-based notification service for real-time admin events.
 *
 * Admin clients connect via GET /api/notifications/stream.
 * When an order is created, call `notifyNewOrder(order)` to push
 * the event to all connected admin clients.
 */

interface SSEClient {
    id: string;
    res: Response;
}

const clients: SSEClient[] = [];

/** Add a new SSE client connection */
export function addClient(req: Request, res: Response): void {
    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    });

    // Send initial connected event
    res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    clients.push({ id: clientId, res });
    console.log(`📡 SSE client connected: ${clientId} (total: ${clients.length})`);

    // Keep-alive ping every 30s
    const keepAlive = setInterval(() => {
        res.write(`: ping\n\n`);
    }, 30_000);

    // Remove client on disconnect
    req.on('close', () => {
        clearInterval(keepAlive);
        const idx = clients.findIndex(c => c.id === clientId);
        if (idx !== -1) clients.splice(idx, 1);
        console.log(`📡 SSE client disconnected: ${clientId} (total: ${clients.length})`);
    });
}

/** Broadcast an event to all connected clients */
function broadcast(event: string, data: any): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.forEach(client => {
        try {
            client.res.write(payload);
        } catch {
            // Client disconnected, will be cleaned up
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
    broadcast('new_order', {
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
export function notifyOrderStatusChange(order: {
    id: string;
    orderNumber: string;
    status: string;
}): void {
    broadcast('order_status', order);
}
